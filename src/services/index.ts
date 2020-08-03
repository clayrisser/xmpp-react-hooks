import { XmppClient } from '@xmpp/client';
import RosterService from './roster';

export default class Services {
  roster: RosterService;

  constructor(client: XmppClient) {
    this.roster = new RosterService(client);
  }
}

export { RosterService };

export * from './roster';
