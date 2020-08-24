import vCardClient from '@xmpp-ts/vcard';
import { XmppClient } from '@xmpp/client';

export default class vCardService extends vCardClient {
  constructor(client: XmppClient) {
    super(client);
  }
}
