/**
 * @jsx xml
 * https://tools.ietf.org/html/rfc6121#section-2
 * https://xmpp.org/extensions/xep-0237.html
 */
import xml from '@xmpp/xml';
import { XmlFragment } from '@xmpp/client';
import StanzaService from './stanza';
import Xmpp from '../xmpp';
import XmppXml from '../xmppXml';

export default class RosterService extends StanzaService {
  constructor(private readonly xmpp: Xmpp) {
    super(xmpp, 'jabber:iq:roster');
  }

  readRosterPush(callback: (roster: RosterItem[]) => any) {
    this.xmpp.handle(
      (iqStanza: XmlFragment) => {
        // TODO: improve with service
        return (
          !iqStanza.attrs.from &&
          iqStanza.attrs.type === 'set' &&
          iqStanza.name === 'iq'
        );
      },
      (iqStanza: XmlFragment) => {
        callback(this.iqStanzaToRoster(iqStanza));
      }
    );
  }

  async removeRosterItem(jid: string, from?: string) {
    if (!from) from = this.xmpp.fullJid;
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
    if (!from) from = this.xmpp.fullJid;
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
    if (!from) from = this.xmpp.fullJid;
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

  iqStanzaToRoster(iqStanza: XmlFragment): RosterItem[] {
    const xmppXml = new XmppXml(iqStanza);
    const iqDocument = xmppXml.document;
    return Array.from(iqDocument.getElementsByTagName('query')).reduce(
      (roster: RosterItem[], queryElement: Element) => {
        if (queryElement.getAttribute('xmlns') === this.namespaceName) {
          Array.from(queryElement.getElementsByTagName('item')).forEach(
            (itemElement: Element) => {
              const groups = Array.from(
                itemElement.getElementsByTagName('group')
              ).map((groupElement: Element) => groupElement.innerHTML);
              const jid = itemElement.getAttribute('jid');
              const name = itemElement.getAttribute('name') || undefined;
              const subscription =
                itemElement.getAttribute('subscription') || undefined;
              if (jid?.length) roster.push({ jid, name, subscription, groups });
            }
          );
        }
        return roster;
      },
      []
    );
  }
}

export interface RosterItem {
  groups: string[];
  jid: string;
  name?: string;
  subscription?: string;
}
