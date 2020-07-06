/**
 * @jsx xml
 * https://tools.ietf.org/html/rfc6121#section-2
 * https://xmpp.org/extensions/xep-0237.html
 */
import xml from '@xmpp/xml';
import { XmlElement } from '@xmpp/client';
import StanzaService from './stanza';
import Xmpp from '../xmpp';

export default class RosterService extends StanzaService {
  constructor(private readonly xmpp: Xmpp) {
    super(xmpp, 'jabber:iq:roster');
  }

  readRosterPush(
    callback: (roster: RosterItem[]) => any,
    { reply = false, from }: { reply?: boolean; from?: string } = {}
  ): () => any {
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
      (iqElement: XmlElement) => {
        if (reply) {
          if (!from) from = this.xmpp.fullJid;
          const id = iqElement.getAttr('id');
          const request = <iq from={from} id={id} type="result" />;
          this.xmpp.client?.send(request);
        }
        callback(this.elementToRoster(iqElement));
      }
    );
  }

  async removeRosterItem({ jid, from }: { jid: string; from?: string }) {
    return this.setRosterItem({
      jid,
      from,
      subscription: RosterSubscription.REMOVE
    });
  }

  async setRosterItem({
    from,
    groups = [],
    jid,
    name,
    subscription
  }: {
    from?: string;
    groups?: string[];
    jid: string;
    name?: string;
    subscription?: RosterSubscription;
  }) {
    if (!from) from = this.xmpp.fullJid;
    const id = Date.now().toString();
    const itemChildren = groups.map((group: string) => <group>{group}</group>);
    const request = (
      <iq from={from} id={id} type="set">
        <query xmlns={this.namespaceName}>
          <item
            jid={jid}
            name={name}
            subscription={this.lookupSubscription(subscription)}
          >
            {itemChildren}
          </item>
        </query>
      </iq>
    );
    const iqElement = await this.xmpp.query(request, [this.namespaceName, id]);
    const err = this.getIqError(iqElement);
    if (err) throw err;
  }

  async getRoster({ from, ver }: { from?: string; ver?: string } = {}): Promise<
    RosterItem[]
  > {
    if (!from) from = this.xmpp.fullJid;
    const id = Date.now().toString();
    const request = (
      <iq from={from} id={id} type="get">
        <query xmlns={this.namespaceName} ver={ver} />
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

  private lookupSubscription(
    subscription?: RosterSubscription
  ): string | undefined {
    switch (subscription) {
      case RosterSubscription.REMOVE:
        return 'remove';
      default:
        
    }
  }
}

export interface RosterItem {
  groups: string[];
  jid: string;
  name?: string;
  subscription: string;
  ver?: string;
}

export enum RosterSubscription {
  REMOVE
}
