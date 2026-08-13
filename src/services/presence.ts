import { PresenceType, type PresenceClientOptions } from '@xmpp-ts/presence';
import type { Client as XmppClient } from '@xmpp/client';
import type { Element as XmlElement } from '@xmpp/xml';
import { PresenceClient } from '../xmppTs.js';

export interface PresenceServiceOptions extends PresenceClientOptions {}

export default class PresenceService extends PresenceClient {
  constructor(client: XmppClient, options: Partial<PresenceServiceOptions>) {
    super(client, {
      defaultSubscribeResponse: PresenceType.SUBSCRIBED,
      ...options
    });
  }

  /**
   * RFC 6120 §8.1.1 lets a server omit `to` on a stanza routed to the
   * connected resource, and omit `from` when the stanza is on behalf of the
   * account itself — both of which describe the presence echo every compliant
   * server sends back after `available()`. Upstream throws on either missing
   * attribute, so fill in what they mean before handing over.
   */
  override parsePresence(presenceElement: XmlElement) {
    const address = this.client?.jid?.toString();
    if (address) {
      if (!presenceElement.attrs.to) presenceElement.attrs.to = address;
      if (!presenceElement.attrs.from) presenceElement.attrs.from = address;
    }
    return super.parsePresence(presenceElement);
  }

  /**
   * A stanza listener throwing takes the whole app down, because nothing above
   * an event emitter can catch it — so a peer (or a disconnected client whose
   * own presence has no addresses to fill in) could crash the host page. Drop
   * the stanza and carry on instead.
   */
  override handleStanza(presenceElement: XmlElement) {
    if (presenceElement?.name !== 'presence') return;
    try {
      super.handleStanza(presenceElement);
    } catch (error) {
      console.warn('ignoring unparseable presence stanza', error);
    }
  }
}
