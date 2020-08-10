import { Message } from '@xmpp-ts/message';
import { Action } from '../types';

export enum MessageActions {
  ReceiveMessage = 'RECEIVE_MESSAGE',
  SendMessage = 'SEND_MESSAGE'
}

export default function messages(
  state: Message[] = [],
  { type, payload }: Action<Message>
) {
  switch (type) {
    case MessageActions.SendMessage: {
      return payload;
    }
    case MessageActions.ReceiveMessage: {
      return payload;
    }
  }
  return state;
}
