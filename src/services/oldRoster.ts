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
    return this.sendRosterQuery({ from, ver, type: IqType.GET });
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

  // TODO: improve to match spec
  enabledHandleRosterPush() {
    this.disableHandleRosterPush();
    this.disableHandleRosterPush = this.readRosterPush(
      ({ iqId, from, to, ver }: RosterItem) => {
        this.sendRosterQuery({
          from: to,
          id: iqId,
          to: from,
          type: IqType.RESULT,
          ver
        });
      }
    );
  }
}

export * from '../clients/roster';
