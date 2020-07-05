/**
 * @jsx xml
 * https://xmpp.org/rfcs/rfc3921.html#presence
 */
import xml from '@xmpp/xml';
import StanzaService from './stanza';
import Xmpp from '../xmpp';

export default class PresenceService extends StanzaService {
  constructor(private readonly xmpp: Xmpp) {
    super(xmpp);
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
  }): Promise<string> {
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

  private lookupShow(show?: PresenceShow): string | undefined {
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
        return;
    }
  }

  private lookupType(type?: PresenceType): string | undefined {
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
        return;
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
