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
      (iqStanza: XmlElement) => {
        // TODO: improve with service
        return (
          !iqStanza.getAttr('from') &&
          !!iqStanza.getAttr('type') &&
          !!iqStanza.name
        );
      },
      (iqStanza: XmlElement) => {
        callback(this.iqStanzaToRoster(iqStanza));
      }
    );
  }

  async removeRosterItem(jid: string, from?: string) {
    if (!from) from = this.xmpp.fullJid!;
    const id = Date.now().toString();
    const request = (
      <iq from={from} id={id} type="set">
        <query xmlns={this.namespaceName}>
          <item jid={jid} subscription="remove" />
        </query>
      </iq>
    );
    const iqStanza = await this.xmpp.query(request, [this.namespaceName, id]);
    const err = this.getIqError(iqStanza);
    if (err) throw err;
  }

  async setRosterItem(jid: string, name?: string, from?: string) {
    if (!from) from = this.xmpp.fullJid!;
    const id = Date.now().toString();
    const item = name ? <item jid={jid} name={name} /> : <item jid={jid} />;
    const request = (
      <iq from={from} id={id} type="set">
        <query xmlns={this.namespaceName}>{item}</query>
      </iq>
    );
    const iqStanza = await this.xmpp.query(request, [this.namespaceName, id]);
    const err = this.getIqError(iqStanza);
    if (err) throw err;
  }

  async getRoster(from?: string): Promise<RosterItem[]> {
    if (!from) from = this.xmpp.fullJid!;
    const jid = from.split('/')[0];
    const id = Date.now().toString();
    const request = (
      <iq from={from} id={id} to={jid} type="get">
        <query xmlns={this.namespaceName} />
      </iq>
    );
    const iqStanza = await this.xmpp.query(request, [this.namespaceName, id]);
    const err = this.getIqError(iqStanza);
    if (err) throw err;
    return this.iqStanzaToRoster(iqStanza);
  }

  iqStanzaToRoster(iqStanza: XmlElement): RosterItem[] {
    return iqStanza
      .getChildren('query')
      .reduce((roster: RosterItem[], queryElement: XmlElement) => {
        if (queryElement.getAttr('xmlns') === this.namespaceName) {
          queryElement
            .getChildren('item')
            .forEach((itemElement: XmlElement) => {
              const groups = itemElement
                .getChildren('group')
                .map((groupElement: XmlElement) => groupElement.text());
              const jid = itemElement.getAttr('jid');
              const name = itemElement.getAttr('name') || undefined;
              const subscription =
                itemElement.getAttr('subscription') || undefined;
              if (jid?.length) roster.push({ jid, name, subscription, groups });
            });
        }
        return roster;
      }, []);
  }
}

export interface RosterItem {
  groups: string[];
  jid: string;
  name?: string;
  subscription?: string;
}
