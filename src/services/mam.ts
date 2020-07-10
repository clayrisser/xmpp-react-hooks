import { MamClient, MamMessage } from '../clients';
import Xmpp, { Cleanup } from '../xmpp';

export default class MamService extends MamClient {
  constructor(xmpp: Xmpp) {
    super(xmpp);
  }

  disableHandleReadMessages: Cleanup = () => {};

  // enabledHandleReadMessages(
  //   callback: (message: MamMessage) => any,
  //   { from, to }: { from?: string; to?: string } = {}
  // ) {
  //   this.disableHandleReadMessages();
  //   this.disableHandleReadMessages = this.readMessages(
  //     (message: MamMessage) => {
  //       if (
  //         message.from.split('/')[0] !== this.xmpp.bareJid ||
  //         message.to.split('/')[0] !== this.xmpp.bareJid
  //       ) {
  //         callback(message);
  //       }
  //     },
  //     { {queryId:} }
  //   );
  // }

  async getMessagesOnRequest({
    after,
    end,
    id,
    max,
    start,
    withJid
  }: {
    after?: number;
    end?: string;
    id?: string;
    max?: number;
    start?: string;
    withJid?: string;
  } = {}): Promise<MamMessage[]> {
    return this.getMessages({ after, end, id, max, start, withJid });
  }
}
