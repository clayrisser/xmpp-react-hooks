import { XmlElement } from '@xmpp/client';
import Xmpp from '../xmpp';

export default class StanzaService {
  constructor(xmpp: Xmpp, public readonly namespaceName = '') {
    if (!xmpp.client) throw new Error('login to access xmpp client');
  }

  getIqError(iqElement: XmlElement): Error | undefined {
    const errorElement = iqElement.getChild('error');
    if (!errorElement) return;
    const err: any = new Error(`iq ${errorElement.getAttr('type')} error`);
    err.stanza = iqElement;
    return err;
  }
}
