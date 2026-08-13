import type { Jid } from '../xmppTs.js';
import type { Message } from '@xmpp-ts/message';
import type { Action } from '../types.js';
import { MessageActions, type MessagePayload } from '../reducers/messages.js';

export function addMessage(jid: Jid, message: Message): Action<MessagePayload> {
  return { payload: { jid, message }, type: MessageActions.AddMessage };
}
