import { EventEmitter } from 'node:events';
import xml from '@xmpp/xml';
import type { Element as XmlElement } from '@xmpp/xml';
import type { Client as XmppClient } from '@xmpp/client';
import { Jid } from '../../../src/xmppTs.js';
import type Services from '../../../src/services/index.js';
import Xmpp from '../../../src/xmpp.js';

export type IqResponder = (request: XmlElement) => XmlElement | undefined;

/**
 * Stands in for an xmpp.js client so the real service classes can be driven
 * without a socket: it records what was sent, answers iq requests through a
 * swappable responder, and lets a test push stanzas and roster pushes in.
 */
export class FakeXmppClient extends EventEmitter {
  jid: Jid;

  sent: XmlElement[] = [];

  started = false;

  stopped = false;

  respondToIq: IqResponder = () => xml('iq', { type: 'result' });

  private iqHandlers = new Map<string, (context: IqCalleeContext) => boolean | Promise<boolean>>();

  iqCaller = {
    request: async (request: XmlElement): Promise<XmlElement> => {
      this.sent.push(request);
      const response = this.respondToIq(request);
      if (!response) throw new Error('no iq responder for request');
      return response;
    }
  };

  iqCallee = {
    get: (namespace: string, name: string, handler: IqCalleeHandler) => {
      this.iqHandlers.set(`get:${namespace}:${name}`, handler);
    },
    set: (namespace: string, name: string, handler: IqCalleeHandler) => {
      this.iqHandlers.set(`set:${namespace}:${name}`, handler);
    }
  };

  constructor(address = 'alice@localhost/test') {
    super();
    this.setMaxListeners(0);
    this.jid = new Jid(address);
  }

  send(element: XmlElement) {
    this.sent.push(element);
    this.emit('send', element);
  }

  async start() {
    this.started = true;
    this.emit('online', this.jid);
  }

  async stop() {
    this.stopped = true;
    this.emit('offline');
  }

  /** Deliver an incoming stanza, as the connection's parser would. */
  deliver(element: XmlElement) {
    this.emit('stanza', element);
  }

  /** Route an incoming iq set the way xmpp.js's iq middleware does. */
  deliverIqSet(namespace: string, name: string, stanza: XmlElement) {
    const handler = this.iqHandlers.get(`set:${namespace}:${name}`);
    if (!handler) throw new Error(`no iq handler for ${namespace}:${name}`);
    return handler({
      element: stanza.getChild(name) ?? undefined,
      entity: this,
      stanza
    });
  }

  /** The last stanza sent whose element name matches. */
  lastSent(name: string): XmlElement | undefined {
    return this.sent.toReversed().find((element) => element.name === name);
  }
}

export interface IqCalleeContext {
  element?: XmlElement;
  entity?: unknown;
  stanza?: XmlElement;
}

export type IqCalleeHandler = (context: IqCalleeContext) => boolean | Promise<boolean>;

export interface FakeXmpp {
  client: FakeXmppClient;
  services: Services;
  xmpp: Xmpp;
}

/**
 * An `Xmpp` wired to a fake client, skipping `login()` so no socket is opened.
 */
export function createFakeXmpp(address = 'alice@localhost/test'): FakeXmpp {
  const client = new FakeXmppClient(address);
  const xmpp = new Xmpp({
    domain: 'localhost',
    resource: 'test',
    service: 'ws://localhost:5280/xmpp-websocket'
  });
  xmpp.attach(client as unknown as XmppClient);
  xmpp.isOnline = true;
  xmpp.isReady = true;
  return { client, services: xmpp.services!, xmpp };
}

export function rosterResult(
  items: Array<{ jid: string; name?: string; subscription?: string }>,
  version = '1'
): XmlElement {
  return xml(
    'iq',
    { type: 'result' },
    xml(
      'query',
      { xmlns: 'jabber:iq:roster', ver: version },
      ...items.map((item) =>
        xml('item', {
          jid: item.jid,
          name: item.name ?? '',
          subscription: item.subscription ?? 'both'
        })
      )
    )
  );
}

export function rosterPush(
  item: { jid: string; name?: string; subscription?: string },
  attrs: { from?: string; ver?: string } = {}
): XmlElement {
  const stanza = xml(
    'iq',
    { type: 'set', id: 'push-1', ...(attrs.from ? { from: attrs.from } : {}) },
    xml(
      'query',
      { xmlns: 'jabber:iq:roster', ver: attrs.ver ?? '2' },
      xml('item', {
        jid: item.jid,
        name: item.name ?? '',
        subscription: item.subscription ?? 'both'
      })
    )
  );
  return stanza;
}

export { xml };
