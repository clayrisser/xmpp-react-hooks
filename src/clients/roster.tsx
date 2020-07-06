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

  readRosterPush(callback: (roster: RosterItem[]) => any): () => any {
    return this.xmpp.handle(
      (iqElement: XmlElement) => {
        const queryElement = iqElement.getChild('query');
        return (
          !!iqElement.getAttr('to') &&
          !!queryElement &&
          !!queryElement.getChild('item') &&
          !iqElement.getAttr('from') &&
          iqElement.getAttr('type') === 'set'
        );
      },
      (iqElement: XmlElement) => callback(this.elementToRoster(iqElement))
    );
  }

  sendRosterQuery({
    from,
    type,
    ver
  }: {
    from?: string;
    type?: IqType;
    ver?: string;
  }): Promise<RosterItem[]>;
  sendRosterQuery({
    from,
    rosterItem,
    type,
    ver
  }: {
    from?: string;
    rosterItem?: Partial<RosterItem>;
    type?: IqType;
    ver?: string;
  }): Promise<void>;
  async sendRosterQuery({
    from,
    rosterItem,
    type,
    ver
  }: {
    from?: string;
    rosterItem?: Partial<RosterItem>;
    type?: IqType;
    ver?: string;
  }): Promise<RosterItem[] | void> {
    if (!from) from = this.xmpp.fullJid;
    const id = Date.now().toString();
    const children = [];
    if (rosterItem) {
      const itemChildren = rosterItem.groups?.map((group: string) => (
        <group>{group}</group>
      ));
      children.push(
        <item
          jid={rosterItem.jid}
          name={rosterItem.name}
          subscription={this.lookupSubscription(rosterItem.subscription)}
        >
          {itemChildren}
        </item>
      );
    }
    const request = (
      <iq from={from} id={id} type={this.lookupIqType(type)}>
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

  elementToRoster(iqElement: XmlElement): RosterItem[] {
    const roster: RosterItem[] = [];
    const queryElement = iqElement.getChild('query');
    if (!queryElement) return roster;
    const ver = queryElement.getAttr('ver');
    if (queryElement.getAttr('xmlns') === this.namespaceName) {
      queryElement.getChildren('item').forEach((itemElement: XmlElement) => {
        const groups = itemElement
          .getChildren('group')
          .map((groupElement: XmlElement) => groupElement.text());
        const jid = itemElement.getAttr('jid');
        const name = itemElement.getAttr('name');
        const subscription = itemElement.getAttr('subscription');
        if (jid && subscription) {
          roster.push({ jid, name, subscription, groups, ver });
        }
      });
    }
    return roster;
  }

  protected lookupSubscription(
    subscription?: string
  ): RosterSubscription | undefined;
  protected lookupSubscription(
    subscription?: RosterSubscription
  ): string | undefined;
  protected lookupSubscription(
    subscription?: RosterSubscription | string
  ): RosterSubscription | string | undefined {
    if (typeof subscription === 'string') {
      switch (subscription) {
        case 'remove':
          return RosterSubscription.REMOVE;
        default:
          return;
      }
    }
    switch (subscription) {
      case RosterSubscription.REMOVE:
        return 'remove';
      default:
        return;
    }
  }
}

export interface RosterItem {
  groups: string[];
  jid: string;
  name?: string;
  subscription: RosterSubscription;
  ver?: string;
}

export enum RosterSubscription {
  REMOVE
}
