import type { Client as XmppClient } from '@xmpp/client';
import MessageService from './message.js';
import PresenceService from './presence.js';
import RosterService from './roster.js';
import VCardService from './vCard.js';

export interface ServicesOptions {
  debug: boolean;
}

export default class Services {
  message: MessageService;

  options: ServicesOptions;

  presence: PresenceService;

  roster: RosterService;

  vCard: VCardService;

  constructor(client: XmppClient, options: Partial<ServicesOptions> = {}) {
    // `?? false` rather than a spread default: callers routinely pass an
    // explicit `debug: undefined`, which a spread would let win.
    this.options = { debug: options.debug ?? false };
    this.message = new MessageService(client, { debug: this.options.debug });
    this.presence = new PresenceService(client, { debug: this.options.debug });
    this.roster = new RosterService(client);
    this.vCard = new VCardService(client);
  }
}

export { MessageService, PresenceService, RosterService, VCardService };

export * from './message.js';
export * from './presence.js';
export * from './roster.js';
export * from './vCard.js';
