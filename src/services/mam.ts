import { MamClient } from '../clients';
import Xmpp from '../xmpp';

export default class MamService extends MamClient {
  constructor(xmpp: Xmpp) {
    super(xmpp);
  }
}

export * from '../clients/mam';
