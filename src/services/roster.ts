import { RosterSubscription } from '@xmpp-ts/roster';
import type { Element as XmlElement } from '@xmpp/xml';
import { Jid, RosterClient } from '../xmppTs.js';

/**
 * The slice of xmpp.js's iq-callee context this handler reads. Declared
 * structurally because `@xmpp/iq` ships no type for it.
 */
export interface RosterPushContext {
  element?: XmlElement;
  stanza?: XmlElement;
}

export default class RosterService extends RosterClient {
  /**
   * Roster pushes were silently dropped, so a contact added or removed
   * anywhere never reached the store.
   *
   * A push comes from the account's own server, which per RFC 6121 §2.1.6
   * means either no `from` attribute at all or our own bare JID. Upstream
   * reads `from` off the middleware context rather than off the stanza, and
   * that context substitutes the server's domain whenever the attribute is
   * absent — so every real push compared `localhost` against `alice@localhost`
   * and was rejected. Reading the raw attribute keeps the anti-spoofing
   * property (a push from any other entity is still refused) while letting
   * legitimate pushes through.
   */
  override handleSetQuery(context: RosterPushContext): boolean {
    const own = this.client?.jid?.bare();
    const from = context.stanza?.attrs?.from;
    if (from && own && !new Jid(String(from)).bare().equals(own)) return false;
    const child = context.element;
    const rosterItem = this.parseRosterItem(child?.getChild('item'));
    if (!rosterItem) return false;
    const version = child?.attrs.ver;
    if (rosterItem.subscription === RosterSubscription.REMOVE) {
      this.emit('remove', { jid: rosterItem.jid, version });
    } else {
      this.emit('set', { item: rosterItem, version });
    }
    return true;
  }
}
