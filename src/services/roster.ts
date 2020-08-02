import RosterClient from '@xmpp-ts/roster';
import { XmppClient } from '@xmpp/client';

export default class RosterService extends RosterClient {
  constructor(client: XmppClient) {
    super(client);
  }
}
