import { XmppClient } from '@xmpp/client';
import PresenceService from './presence';
import RosterService from './roster';

export interface ServicesOptions {
  debug: boolean;
}

export default class Services {
  presence: PresenceService;

  roster: RosterService;

  options: ServicesOptions;

  constructor(client: XmppClient, options: Partial<ServicesOptions> = {}) {
    this.options = {
      debug: false,
      ...options
    };
    this.presence = new PresenceService(client, { debug: this.options.debug });
    this.roster = new RosterService(client);
  }
}

export { RosterService, PresenceService };

export * from './presence';
export * from './roster';
