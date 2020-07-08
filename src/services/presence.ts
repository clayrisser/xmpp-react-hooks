import Xmpp, { Cleanup } from '../xmpp';
import PresenceClient, { PresenceType, Presence } from '../clients/presence';

export default class PresenceService extends PresenceClient {
  disableHandlePresenceSubscribe: Cleanup = () => {
    console.log('hello world');
  };

  constructor(xmpp: Xmpp) {
    super(xmpp);
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