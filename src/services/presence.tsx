/**
 * @jsx xml
 * https://xmpp.org/rfcs/rfc3921.html#presence
 */
import xml from '@xmpp/xml';
import { XmlElement } from '@xmpp/client';
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
      <presence
        xml={lang}
        to={to}
        from={from}
        type={this.lookupType(type)}
        id={Date.now()}
      >
        {children}
      </presence>
    );
    const result: XmlElement = await this.xmpp.query(request);
    console.log('result', result);
    return this.elementToPresence(result);
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
    }
  }

  elementToPresence(iqElement: XmlElement): any {
    console.log('iq', iqElement);
    // const roster: RosterItem[] = [];
    const queryElement = iqElement.getChild('query');
    // if (!queryElement) return roster;
    // const ver = queryElement.getAttr('ver');
    console.log('query', queryElement);
    // if (queryElement.getAttr('xmlns') === this.namespaceName) {
    //   queryElement.getChildren('item').forEach((itemElement: XmlElement) => {
    //     const groups = itemElement
    //       .getChildren('group')
    //       .map((groupElement: XmlElement) => groupElement.text());
    //     const jid = itemElement.getAttr('jid');
    //     const name = itemElement.getAttr('name');
    //     const subscription = itemElement.getAttr('subscription');
    //     if (jid && subscription) {
    //       roster.push({ jid, name, subscription, groups, ver });
    //     }
    //   });
    // }
    // return roster;
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
