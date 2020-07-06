import Xmpp, { Cleanup } from '../xmpp';
import PresenceService, { PresenceType, Presence } from '../services/presence';

export default class PresenceWrapperService {
  service: PresenceService;

  disableHandlePresenceSubscribe: Cleanup = () => {};

  constructor(private readonly xmpp: Xmpp) {
    this.service = new PresenceService(xmpp);
  }

  enabledHandlePresenceSubscribe({
    type = PresenceType.SUBSCRIBED
  }: { type?: PresenceType.SUBSCRIBED | PresenceType.UNSUBSCRIBED } = {}) {
    this.disableHandlePresenceSubscribe();
    this.disableHandlePresenceSubscribe = this.service.readPresence(
      (presence: Presence) => {
        this.service.sendPresence({
          from: this.xmpp?.bareJid,
          to: presence.from,
          type
        });
      },
      { type: PresenceType.SUBSCRIBE }
    );
  }
}

export * from '../services/presence';
