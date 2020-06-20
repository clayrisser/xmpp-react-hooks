import { XmlFragment } from '@xmpp/client';
import Xmpp from '../xmpp';
import XmppXml from '../xmppXml';

export default class StanzaService {
  constructor(xmpp: Xmpp, public readonly namespaceName = '') {
    if (!xmpp.client) throw new Error('login to access xmpp client');
  }

  getIqError(iqStanza: XmlFragment): Error | undefined {
    const xmppXml = new XmppXml(iqStanza);
    const iqDocument = xmppXml.document;
    const errorElement = Array.from(
      iqDocument.getElementsByTagName('error')
    )?.[0];
    if (!errorElement) return;
    const err: any = new Error(`iq ${errorElement.getAttribute('type')} error`);
    err.stanza = iqStanza;
    err.document = iqDocument;
    return err;
  }
}
