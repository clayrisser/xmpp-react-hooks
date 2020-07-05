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

  readRosterPush(callback: (roster: RosterItem[]) => any): () => any {
    return this.xmpp.handle(
      (iqElement: XmlElement) => {
        // TODO: improve with service
        return (
          !iqElement.getAttr('from') &&
          !!iqElement.getAttr('type') &&
          !!iqElement.name
        );
      },
      (iqElement: XmlElement) => {
        callback(this.elementToRoster(iqElement));
      }
    );
  }

  // H
  async removeRosterItem(jid: string, from?: string) {
    // const subscription: string = 'remove';
    // return this.setRosterItem(jid, from, subscription);
    if (!from) from = this.xmpp.fullJid!;
    const id = Date.now().toString();
    const request = (
      <iq from={from} id={id} type="set">
        <query xmlns={this.namespaceName}>
          <item jid={jid} subscription="remove" />
        </query>
      </iq>
    );
    const iqElement = await this.xmpp.query(request, [this.namespaceName, id]);
    const err = this.getIqError(iqElement);
    if (err) throw err;
  }

  async setRosterItem(
    group?: string,
    jid?: string,
    name?: string,
    subscription?: string,
    from?: string
  ) {
    if (!from) from = this.xmpp.fullJid!;
    if (!jid) jid = this.xmpp.fullJid;
    const id = Date.now().toString();
    const item = name ? (
      <item jid={jid} name={name}>
        {/* <group>{group}</group> */}
      </item>
    ) : (
      <item jid={jid}>{/* <group>{group}</group> */}</item>
    );
    const request = (
      <iq from={from} id={id} type="set">
        <query xmlns={this.namespaceName}>{item}</query>
      </iq>
    );
    const iqElement = await this.xmpp.query(request, [this.namespaceName, id]);
    const err = this.getIqError(iqElement);
    if (err) throw err;
  }

  async getRoster({ from, ver }: { from?: string; ver?: string } = {}): Promise<
    RosterItem[]
  > {
    if (!from) from = this.xmpp.fullJid!;
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
}

export interface RosterItem {
  groups: string[];
  jid: string;
  name?: string;
  subscription: string;
  ver?: string;
}
