import Xmpp, { Cleanup } from '../xmpp';
import {
  IqType,
  RosterClient,
  RosterItem,
  RosterSubscription
} from '../clients';

export default class RosterService extends RosterClient {
  disableHandleRosterPush: Cleanup = () => {};
  constructor(xmpp: Xmpp) {
    super(xmpp);
  }

  async setRosterItem({
    from,
    groups = [],
    jid,
    name,
    subscription
  }: {
    from?: string;
    groups?: string[];
    jid: string;
    name?: string;
    subscription?: RosterSubscription;
  }) {
    return this.sendRosterQuery({
      from,
      rosterItem: { groups, jid, name, subscription }
    });
  }

  async getRoster({ from, ver }: { from?: string; ver?: string } = {}): Promise<
    RosterItem[]
  > {
    return this.sendRosterQuery({ from, ver });
  }

  async removeRosterItem({ jid, from }: { jid: string; from?: string }) {
    return this.setRosterItem({
      jid,
      from,
      subscription: RosterSubscription.REMOVE
    });
  }

  enabledHandleRosterPush() {
    this.disableHandleRosterPush();
    this.disableHandleRosterPush = this.readRosterPush(
      (_roster: RosterItem[]) => {
        this.sendRosterQuery({ type: IqType.RESULT });
      }
    );
  }
}

export * from '../clients/roster';
