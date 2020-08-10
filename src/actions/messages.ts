import Jid from '@xmpp-ts/jid';
import { Message } from '@xmpp-ts/message';
import { Action } from '../types';
import { MessageActions, MessagePayload } from '../reducers/messages';

export function addMessage(jid: Jid, message: Message): Action<MessagePayload> {
  return { payload: { jid, message }, type: MessageActions.AddMessage };
}
