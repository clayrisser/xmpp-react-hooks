/*
 * https://tools.ietf.org/html/rfc6121
 * */
import xmppDebug from '@xmpp/debug';
import { client as xmppClient } from '@xmpp/client';
import type { Client as XmppClient } from '@xmpp/client';
import type { Element as XmlElement } from 'ltx';
import Services from './services/index.js';

export default class Xmpp {
  client?: XmppClient;

  isOnline = false;

  isReady = false;

  readonly config: Config;

  readonly lang: string;

  services?: Services;

  private errorListeners = new Set<ErrorListener>();

  constructor(config: Config) {
    if (!config.hostname && !config.domain) {
      throw new Error('hostname or domain is required');
    }
    if (!config.hostname && !config.service) {
      throw new Error('hostname or service is required');
    }
    this.config = config;
    this.lang = this.config.lang || 'en';
  }

  private createCheckCondition(condition: CheckCondition | string | string[]): CheckCondition {
    if (Array.isArray(condition)) {
      const [namespaceName, id] = condition;
      return (stanzaElement: XmlElement) =>
        !!stanzaElement.getChildByAttr('xmlns', namespaceName as string) &&
        stanzaElement.getAttr('id') === id &&
        (stanzaElement.getAttr('type') === 'result' || stanzaElement.getAttr('type') === 'error') &&
        stanzaElement.name === 'iq';
    }
    if (typeof condition === 'string') {
      return (stanzaElement: XmlElement) =>
        stanzaElement.getAttr('id') === condition &&
        (stanzaElement.getAttr('type') === 'result' || stanzaElement.getAttr('type') === 'error') &&
        stanzaElement.name === 'iq';
    }
    return condition;
  }

  /**
   * Rethrowing here would escape through the client's event emitter and take
   * the whole app down, since nothing above an emitter can catch it. Errors
   * are fanned out to subscribers instead.
   */
  private handleError(err: Error) {
    if (this.errorListeners.size === 0) {
      console.error('xmpp error', err);
      return;
    }
    for (const listener of this.errorListeners) listener(err);
  }

  private handleOnline() {
    this.isOnline = true;
    this.isReady = true;
  }

  private handleOffline() {
    this.isOnline = false;
  }

  onError(listener: ErrorListener): Cleanup {
    this.errorListeners.add(listener);
    return () => this.errorListeners.delete(listener);
  }

  /**
   * Adopt an already-built xmpp.js client: wire up status tracking, error
   * fan-out and the stanza services. `login()` calls this; call it yourself to
   * supply a client configured beyond what `Config` covers.
   */
  attach(client: XmppClient): this {
    this.client = client;
    client.on('error', this.handleError.bind(this));
    client.on('offline', this.handleOffline.bind(this));
    client.on('online', this.handleOnline.bind(this));
    if (this.config.debug) xmppDebug(client, true);
    this.services = new Services(client, { debug: this.config.debug });
    return this;
  }

  async login(username: string, password: string) {
    const domain = this.config.domain || this.config.hostname;
    const { resource } = this.config;
    const service = this.config.service || `wss://${this.config.hostname}/ws`;
    this.attach(xmppClient({ password, username, service, domain, resource }));
  }

  async start() {
    if (!this.client) throw new Error('login to create xmpp client');
    await this.client.start();
  }

  /**
   * `stop()` also disables reconnection, so the instance is spent afterwards —
   * call `login()` again to get a usable client back.
   */
  async stop() {
    if (!this.client) return;
    // Only announce departure if we ever arrived. Sending presence from an
    // unauthenticated client produces a stanza with no addresses at all.
    if (this.isOnline && this.client.jid) {
      this.services?.presence.unavailable();
    }
    await this.client.stop();
    this.isOnline = false;
    this.isReady = false;
  }

  handle(
    condition: CheckCondition | string | string[],
    readCallback: ReadCallback,
    event = 'stanza'
  ): Cleanup {
    if (!this.client) throw new Error('login to create xmpp client');
    const client = this.client;
    const checkCondition = this.createCheckCondition(condition);
    const listener = (stanzaElement: XmlElement) => {
      if (checkCondition(stanzaElement)) readCallback(stanzaElement);
    };
    client.on(event, listener);
    return () => client.removeListener(event, listener);
  }

  query(request: any, condition?: CheckCondition | string | string[]): Promise<XmlElement>;

  query(
    request: any,
    condition: CheckCondition | string | string[],
    readCallback: ReadCallback,
    event?: string
  ): Promise<Cleanup>;

  async query(
    request: any,
    condition: CheckCondition | string | string[] = () => true,
    readCallback?: ReadCallback,
    event = 'stanza'
  ): Promise<XmlElement | Cleanup> {
    if (!this.client) throw new Error('login to create xmpp client');
    const client = this.client;
    const checkCondition = this.createCheckCondition(condition);
    if (readCallback) {
      const listener = (stanzaElement: XmlElement) => {
        if (checkCondition(stanzaElement)) readCallback(stanzaElement);
      };
      client.on(event, listener);
      client.send(request);
      return () => client.removeListener(event, listener);
    }
    return new Promise<XmlElement>((resolve, reject) => {
      const listener = (stanza: XmlElement) => {
        if (checkCondition(stanza)) {
          client.removeListener(event, listener);
          resolve(stanza);
        }
      };
      client.on(event, listener);
      try {
        client.send(request);
      } catch (err) {
        client.removeListener(event, listener);
        reject(err as Error);
      }
    });
  }
}

export interface Config {
  debug?: boolean;
  domain?: string;
  hostname?: string;
  lang?: string;
  resource: string;
  service?: string;
}

export type QueryRunner = (
  request: any,
  checkCondition?: CheckCondition | string | string[],
  readCallback?: ReadCallback
) => Promise<XmlElement>;

export type Handle = (
  checkCondition: CheckCondition | string | string[],
  readCallback: ReadCallback
) => any;

export type CheckCondition = (stanza: XmlElement) => boolean;

export type ReadCallback = (stanza: XmlElement) => any;

export type ErrorListener = (error: Error) => void;

export type Cleanup = () => any;
