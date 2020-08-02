import RosterClient from '@xmpp-ts/roster';
import { XmppClient } from '@xmpp/client';

export default class NewRosterService extends RosterClient {
  constructor(xmpp: XmppClient) {
    super(xmpp);
  }
}
