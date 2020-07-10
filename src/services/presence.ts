import Xmpp, { Cleanup } from '../xmpp';
import PresenceClient, {
  PresenceType,
  Presence,
  PresenceShow
} from '../clients/presence';

export default class PresenceService extends PresenceClient {
  disableHandlePresenceSubscribe: Cleanup = () => {};

  constructor(xmpp: Xmpp) {
    super(xmpp);
  }

  readAvailable(
    callback: (presence: Presence) => any,
    {
      from,
      show
    }: {
      from?: string;
      show?: PresenceShow;
    } = {}
  ): Cleanup {
    return this.readPresence(
      (presence: Presence) => {
        if (presence.from.split('/')[0] !== this.xmpp.bareJid) {
          callback(presence);
        }
      },
      { type: null, from, show }
    );
  }

  readUnavailable(
    callback: (presence: Presence) => any,
    {
      from,
      show
    }: {
      from?: string;
      show?: PresenceShow;
    } = {}
  ): Cleanup {
    return this.readPresence(
      (presence: Presence) => {
        if (presence.from.split('/')[0] !== this.xmpp.bareJid) {
          callback(presence);
        }
      },
      {
        type: PresenceType.UNAVAILABLE,
        from,
        show
      }
    );
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
