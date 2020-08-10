import { Message } from '@xmpp-ts/message';
import { Action } from '../types';
import { MessageActions } from '../reducers/messages';

export function sendMessage(message: Message): Action<Message> {
  return { payload: message, type: MessageActions.SendMessage };
}

export function recieveMessage(message: Message): Action<Message> {
  return { payload: message, type: MessageActions.RecieveMessage };
}
