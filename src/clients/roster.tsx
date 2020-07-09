/**
 * @jsx xml
 * https://tools.ietf.org/html/rfc6121#section-2
 * https://xmpp.org/extensions/xep-0237.html
 */
import xml from '@xmpp/xml';
import { XmlElement } from '@xmpp/client';
import StanzaClient, { IqType } from './stanza';
import Xmpp from '../xmpp';

export default class RosterClient extends StanzaClient {
  constructor(private readonly xmpp: Xmpp) {
    super(xmpp, 'jabber:iq:roster');
  }

  readRosterPush(callback: (roster: RosterItem) => any): () => any {
    return this.xmpp.handle(
      (iqElement: XmlElement) => {
        const queryElement = iqElement.getChild('query');
        return (
          !!iqElement.getAttr('to') &&
          !!queryElement &&
          !!queryElement.getChild('item') &&
          !!iqElement.getAttr('from') &&
          iqElement.getAttr('type') === 'set'
        );
      },
      (iqElement: XmlElement) => {
        const rosterItem = this.elementToRoster(iqElement)?.[0];
        if (rosterItem) callback(rosterItem);
      }
    );
  }

  sendRosterQuery({
    from,
    id,
    to,
    type,
    ver
  }: {
    from?: string;
    id?: string;
    to?: string;
    type: IqType;
    ver?: string;
  }): Promise<RosterItem[]>;
  sendRosterQuery({
    from,
    id,
    rosterItem,
    to,
    type,
    ver
  }: {
    from?: string;
    id?: string;
    rosterItem?: Partial<RosterItem>;
    to?: string;
    type?: IqType;
    ver?: string;
  }): Promise<void>;
  async sendRosterQuery({
    from,
    id,
    rosterItem,
    to,
    type,
    ver
  }: {
    from?: string;
    id?: string;
    rosterItem?: Partial<RosterItem>;
    to?: string;
    type?: IqType;
    ver?: string;
  }): Promise<RosterItem[] | void> {
    if (!from) from = this.xmpp.fullJid;
    if (!id) id = Date.now().toString();
    const children = [];
    if (rosterItem) {
      const itemChildren = rosterItem.groups?.map((group: string) => (
        <group>{group}</group>
      ));
      children.push(
        <item
          jid={rosterItem.jid}
          name={rosterItem.name}
          subscription={rosterItem.subscription}
        >
          {itemChildren}
        </item>
      );
    }
    const request = (
      <iq to={to} from={from} id={id} type={type}>
        <query xmlns={this.namespaceName} ver={ver}>
          {children}
        </query>
      </iq>
    );
    const iqElement = await this.xmpp.query(request, [this.namespaceName, id]);
    const err = this.getIqError(iqElement);
    if (err) throw err;
    return this.elementToRoster(iqElement);
  }

  private elementToRoster(iqElement: XmlElement): RosterItem[] {
    const roster: RosterItem[] = [];
    const queryElement = iqElement.getChild('query');
    if (!queryElement) return roster;
    const from = iqElement.getAttr('from');
    const iqId = iqElement.getAttr('id');
    const to = iqElement.getAttr('to');
    const ver = queryElement.getAttr('ver');
    if (queryElement.getAttr('xmlns') === this.namespaceName) {
      queryElement.getChildren('item').forEach((itemElement: XmlElement) => {
        const groups = itemElement
          .getChildren('group')
          .map((groupElement: XmlElement) => groupElement.text());
        const jid = itemElement.getAttr('jid');
        const name = itemElement.getAttr('name');
        const ask = itemElement.getAttr('ask');
        const subscription = itemElement.getAttr('subscription');
        if (jid && iqId) {
          roster.push({
            ask,
            from,
            groups,
            iqId,
            jid,
            name,
            subscription,
            to,
            ver
          });
        }
      });
    }
    return roster;
  }
}

export interface RosterItem {
  ask?: RosterAsk;
  from?: string;
  groups: string[];
  iqId?: string;
  jid: string;
  name?: string;
  subscription?: RosterSubscription;
  to?: string;
  ver?: string;
}

export enum RosterSubscription {
  REMOVE = 'remove'
}

export enum RosterAsk {
  SUBSCRIBE = 'subscribe'
}
