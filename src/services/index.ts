import { XmppClient } from '@xmpp/client';
import MessageService from './message';
import PresenceService from './presence';
import RosterService from './roster';

export interface ServicesOptions {
  debug: boolean;
}

export default class Services {
  message: MessageService;
  options: ServicesOptions;
  presence: PresenceService;
  roster: RosterService;

  constructor(client: XmppClient, options: Partial<ServicesOptions> = {}) {
    this.options = {
      debug: false,
      ...options
    };
    this.message = new MessageService(client, { debug: this.options.debug });
    this.presence = new PresenceService(client, { debug: this.options.debug });
    this.roster = new RosterService(client);
  }
}

export { MessageService, PresenceService, RosterService };

export * from './message';
export * from './presence';
export * from './roster';
