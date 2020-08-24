import { XmppClient } from '@xmpp/client';
import MessageService from './message';
import PresenceService from './presence';
import RosterService from './roster';
import vCardService from './vCard';

export interface ServicesOptions {
  debug: boolean;
}

export default class Services {
  message: MessageService;

  options: ServicesOptions;

  presence: PresenceService;

  roster: RosterService;

  vCard: vCardService;

  constructor(client: XmppClient, options: Partial<ServicesOptions> = {}) {
    this.options = {
      debug: false,
      ...options
    };
    this.message = new MessageService(client, { debug: this.options.debug });
    this.presence = new PresenceService(client, { debug: this.options.debug });
    this.roster = new RosterService(client);
    this.vCard = new vCardService(client);
  }
}

export { MessageService, PresenceService, RosterService, vCardService };

export * from './message';
export * from './presence';
export * from './roster';
export * from './vCard';
