/**
 * @jsx xml
 * https://xmpp.org/rfcs/rfc3921.html#presence
 */
import xml from '@xmpp/xml';
import { XmlElement } from '@xmpp/client';
import StanzaClient from './stanza';
import Xmpp, { Cleanup } from '../xmpp';

export default class PresenceClient extends StanzaClient {
  constructor(protected readonly xmpp: Xmpp) {
    super(xmpp);
  }

  readPresence(
    callback: (presence: Presence) => any,
    {
      from,
      show,
      to,
      type
    }: {
      from?: string;
      show?: PresenceShow;
      to?: string;
      type?: PresenceType | null;
    } = {}
  ): Cleanup {
    return this.xmpp.handle(
      (presenceElement: XmlElement) => {
        if (!to) to = this.xmpp.fullJid;
        return (
          (typeof type === 'undefined' ||
            (type === null && !presenceElement.getAttr('type')) ||
            presenceElement.getAttr('type') === type) &&
          !!presenceElement.getAttr('from') &&
          (!from || presenceElement.getAttr('from') === from) &&
          presenceElement.getAttr('to')?.split('/')[0] === to?.split('/')[0] &&
          presenceElement.name === 'presence' &&
          (!show || presenceElement.getChild('show')?.text() === show)
        );
      },
      (presenceElement: XmlElement) => {
        const presence = this.elementToPresence(presenceElement);
        return callback(presence);
      }
    );
  }

  sendPresence({
    from,
    lang,
    priority,
    show,
    status,
    to,
    type
  }: {
    from?: string;
    lang?: string;
    priority?: number;
    show?: PresenceShow;
    status?: string;
    to?: string;
    type?: PresenceType;
  } = {}) {
    if (!lang) lang = this.xmpp.lang!;
    const children = [];
    if (show) {
      children.push(<show>{show}</show>);
      if (status) children.push(<status>{status}</status>);
    }
    if (typeof priority === 'number') {
      if (priority < -128 || priority > 127) {
        throw new Error('priority must be an integer between -128 and +127');
      }
      children.push(<priority>{priority}</priority>);
    }
    const request = (
      <presence xml={lang} to={to} from={from} type={type}>
        {children}
      </presence>
    );
    this.xmpp.query(request);
  }

  private elementToPresence(presenceElement: XmlElement): Presence {
    const from = presenceElement.getAttr('from');
    const priorityString = presenceElement.getChild('priority')?.text();
    const showString = presenceElement.getChild('show')?.text();
    const show = showString?.length ? (showString as PresenceShow) : undefined;
    const status = presenceElement.getChild('status')?.text();
    const to = presenceElement.getAttr('to');
    const priority = priorityString?.length
      ? Number(priorityString)
      : undefined;
    if (!to || !from) throw new Error('invalid presence stanza');
    return {
      from,
      priority,
      show,
      status,
      to
    };
  }
}

export enum PresenceShow {
  AWAY = 'away',
  CHAT = 'chat',
  DND = 'dnd',
  XA = 'xa'
}

export enum PresenceType {
  ERROR = 'error',
  PROBE = 'probe',
  SUBSCRIBE = 'subscribe',
  SUBSCRIBED = 'subscribed',
  UNAVAILABLE = 'unavailable',
  UNSUBSCRIBE = 'unsubscribe',
  UNSUBSCRIBED = 'unsubscribed'
}

export interface Presence {
  from: string;
  priority?: number;
  show?: PresenceShow;
  status?: string;
  to: string;
}
