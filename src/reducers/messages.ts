import Jid from '@xmpp-ts/jid';
import { Message } from '@xmpp-ts/message';
import { Action } from '../types';
import { Messages } from '../state';

export enum MessageActions {
  AddMessage = 'ADD_MESSAGE'
}

export interface MessagePayload {
  jid: Jid;
  message: Message;
}

export default function messages(
  state: Messages = {},
  { type, payload }: Action<MessagePayload>
) {
  switch (type) {
    case MessageActions.AddMessage: {
      const messages = Object.entries(state).reduce(
        (messages: Messages, [key, value]: [string, Message[]]) => {
          messages[key] = [...value];
          return messages;
        },
        {}
      );
      const { jid, message } = payload;
      const key = jid.bare().toString();
      if (!messages[key]) messages[key] = [];
      if (
        messages[key].some((state_message) => state_message.id === message.id)
      ) {
        return messages;
      }
      messages[key].push(message);
      return messages;
    }
  }
  return state;
}
