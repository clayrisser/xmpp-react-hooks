import Xmpp from '../xmpp';
import { MessageClient } from '../clients';

export default class MessageService extends MessageClient {
  constructor(xmpp: Xmpp) {
    super(xmpp);
  }
}

export * from '../clients/message';
