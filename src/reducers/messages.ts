import { Message } from '@xmpp-ts/message';
import { Action } from '../types';

export enum MessageActions {
  RecieveMessage = 'RECIEVE_MESSAGE',
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
    case MessageActions.RecieveMessage: {
      return payload;
    }
  }
  return state;
}
