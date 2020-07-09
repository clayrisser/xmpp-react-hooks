import Xmpp, { Cleanup } from '../xmpp';
import PresenceClient, { PresenceType, Presence } from '../clients/presence';

export default class PresenceService extends PresenceClient {
  disableHandlePresenceSubscribe: Cleanup = () => {};

  constructor(xmpp: Xmpp) {
    super(xmpp);
  }

  async sendAvailable() {
    this.sendPresence();
  }

  async sendUnavailable() {
    this.sendPresence({
      type: PresenceType.UNAVAILABLE
    });
  }

  enabledHandlePresenceSubscribe({
    type = PresenceType.SUBSCRIBED
  }: { type?: PresenceType.SUBSCRIBED | PresenceType.UNSUBSCRIBED } = {}) {
    this.disableHandlePresenceSubscribe();
    this.disableHandlePresenceSubscribe = this.readPresence(
      (presence: Presence) => {
        this.sendPresence({
          from: this.xmpp?.bareJid,
          to: presence.from,
          type
        });
      },
      { type: PresenceType.SUBSCRIBE }
    );
  }
}

export * from '../clients/presence';
