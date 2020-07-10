import Xmpp, { Cleanup } from '../xmpp';
import { MessageClient, Message } from '../clients';

export default class MessageService extends MessageClient {
  disableHandleReadMessages: Cleanup = () => {};

  disableHandleReadSentMessages: Cleanup = () => {};

  constructor(xmpp: Xmpp) {
    super(xmpp);
  }

  async sendMessageItem({
    from,
    to,
    body
  }: {
    to?: string;
    body?: string;
    from?: string;
  } = {}) {
    return this.sendMessage({ from, to, body });
  }

  // readIncomingMessages(
  //   callback: (message: Message) => any,
  //   {
  //     from,
  //     to
  //   }: {
  //     from?: string;
  //     to?: string;
  //   } = {}
  // ): Cleanup {
  //   return this.readMessages((message: Message) => {
  //     if (message.from.split('/')[0] !== this.xmpp.bareJid) {
  //       callback(message);
  //     }
  //     console.log('message', message);
  //   });
  // }

  enabledHandleReadMessages(
    callback: (message: Message) => any,
    { from, to }: { from?: string; to?: string } = {}
  ) {
    this.disableHandleReadMessages();
    this.disableHandleReadMessages = this.readMessages(
      (message: Message) => {
        if (message.from.split('/')[0] !== this.xmpp.bareJid) {
          callback(message);
        }
      },
      { to: this.xmpp.fullJid }
    );
  }

  enabledHandleReadSentMessages(
    callback: (message: Message) => any,
    { from, to }: { from?: string; to?: string } = {}
  ) {
    this.disableHandleReadSentMessages();
    this.disableHandleReadSentMessages = this.readSentMessages(
      (message: Message) => {
        if (message.from.split('/')[0] === this.xmpp.bareJid) {
          callback(message);
        }
      },
      { from: this.xmpp.fullJid }
    );
  }
}

export * from '../clients/message';
