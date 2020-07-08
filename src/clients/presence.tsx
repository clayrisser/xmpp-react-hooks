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
      noType,
      show,
      to,
      type
    }: {
      from?: string;
      noType?: boolean;
      show?: PresenceShow;
      to?: string;
      type?: PresenceType;
    } = {}
  ): Cleanup {
    return this.xmpp.handle(
      (presenceElement: XmlElement) => {
        if (!to) to = this.xmpp.fullJid;
        return (
          (!noType || !presenceElement.getAttr('type')) &&
          !!presenceElement.getAttr('from') &&
          (!from || presenceElement.getAttr('from') === from) &&
          presenceElement.getAttr('to') === to &&
          presenceElement.name === 'presence' &&
          (!type ||
            presenceElement.getAttr('type') === this.lookupType(type)) &&
          (!show ||
            presenceElement.getChild('show')?.text() === this.lookupShow(show))
        );
      },
      (presenceElement: XmlElement) => {
        const presence = this.elementToPresence(presenceElement);

        return callback(presence);
      }
    );
  }

  async sendPresence({
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
  } = {}): Promise<string> {
    if (!lang) lang = this.xmpp.lang!;
    const children = [];
    if (show) {
      children.push(<show>{this.lookupShow(show)}</show>);
      if (status) children.push(<status>{status}</status>);
    }
    if (typeof priority === 'number') {
      if (priority < -128 || priority > 127) {
        throw new Error('priority must be an integer between -128 and +127');
      }
      children.push(<priority>{priority}</priority>);
    }
    const request = (
      <presence xml={lang} to={to} from={from} type={this.lookupType(type)}>
        {children}
      </presence>
    );
    const result = await this.xmpp.query(request);
    return result.toString();
  }

  private elementToPresence(presenceElement: XmlElement): Presence {
    const from = presenceElement.getAttr('from');
    const priorityString = presenceElement.getChild('priority')?.text();
    const showString = presenceElement.getChild('show')?.text();
    const show = showString?.length ? this.lookupShow(showString) : undefined;
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

  protected lookupShow(show?: string): PresenceShow | undefined;
  protected lookupShow(show?: PresenceShow): string | undefined;
  protected lookupShow(
    show?: PresenceShow | string
  ): PresenceShow | string | undefined {
    if (typeof show === 'string') {
      switch (show) {
        case 'away':
          return PresenceShow.AWAY;
        case 'chat':
          return PresenceShow.CHAT;
        case 'dnd':
          return PresenceShow.DND;
        case 'xa':
          return PresenceShow.XA;
        default:
          return;
      }
    }
    switch (show) {
      case PresenceShow.AWAY:
        return 'away';
      case PresenceShow.CHAT:
        return 'chat';
      case PresenceShow.DND:
        return 'dnd';
      case PresenceShow.XA:
        return 'xa';
      default:
    }
  }

  protected lookupType(type?: PresenceType): string | undefined;
  protected lookupType(type?: string): PresenceType | undefined;
  protected lookupType(
    type?: PresenceType | string
  ): PresenceType | string | undefined {
    if (typeof type === 'string') {
      switch (type) {
        case 'error':
          return PresenceType.ERROR;
        case 'probe':
          return PresenceType.PROBE;
        case 'subscribe':
          return PresenceType.SUBSCRIBE;
        case 'subscribed':
          return PresenceType.SUBSCRIBED;
        case 'unavailable':
          return PresenceType.UNAVAILABLE;
        case 'unsubscribe':
          return PresenceType.UNSUBSCRIBE;
        case 'unsubscribed':
          return PresenceType.UNSUBSCRIBED;
        default:
          return;
      }
    }
    switch (type) {
      case PresenceType.ERROR:
        return 'error';
      case PresenceType.PROBE:
        return 'probe';
      case PresenceType.SUBSCRIBE:
        return 'subscribe';
      case PresenceType.SUBSCRIBED:
        return 'subscribed';
      case PresenceType.UNAVAILABLE:
        return 'unavailable';
      case PresenceType.UNSUBSCRIBE:
        return 'unsubscribe';
      case PresenceType.UNSUBSCRIBED:
        return 'unsubscribed';
      default:
    }
  }
}

export enum PresenceShow {
  AWAY,
  CHAT,
  DND,
  XA
}

export enum PresenceType {
  ERROR,
  PROBE,
  SUBSCRIBE,
  SUBSCRIBED,
  UNAVAILABLE,
  UNSUBSCRIBE,
  UNSUBSCRIBED
}

export interface Presence {
  from: string;
  priority?: number;
  show?: PresenceShow;
  status?: string;
  to: string;
}
