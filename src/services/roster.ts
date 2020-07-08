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

  async setRosterItem(
    rosterItem: Partial<RosterItem>,
    {
      from
    }: {
      from?: string;
    } = {}
  ) {
    return this.sendRosterQuery({ from, rosterItem, type: IqType.SET });
  }

  async getRoster({ from, ver }: { from?: string; ver?: string } = {}): Promise<
    RosterItem[]
  > {
    return this.sendRosterQuery({ from, ver });
  }

  async removeRosterItem({ jid, from }: { jid: string; from?: string }) {
    return this.sendRosterQuery({
      from,
      type: IqType.SET,
      rosterItem: {
        jid,
        subscription: RosterSubscription.REMOVE
      }
    });
  }

  enabledHandleRosterPush() {
    this.disableHandleRosterPush();
    this.disableHandleRosterPush = this.readRosterPush(
      ({ iqId }: RosterItem) => {
        this.sendRosterQuery({ type: IqType.RESULT, id: iqId });
      }
    );
  }
}

export * from '../clients/roster';
