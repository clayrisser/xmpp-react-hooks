import MessageClient, { MessageClientOptions } from '@xmpp-ts/message';
import { XmppClient } from '@xmpp/client';

export interface MessageServiceOptions extends MessageClientOptions {}

export default class MessageService extends MessageClient {
  constructor(client: XmppClient, options: Partial<MessageServiceOptions>) {
    super(client, options);
  }
}
