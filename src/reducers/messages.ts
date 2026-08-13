import type { Jid } from '../xmppTs.js';
import type { Message } from '@xmpp-ts/message';
import type { Action } from '../types.js';
import type { Messages } from '../state.js';

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
): Messages {
  switch (type) {
    case MessageActions.AddMessage: {
      const { jid, message } = payload;
      const key = jid.bare().toString();
      const conversation = state[key] ?? [];
      // Carbons and stream resumption both replay stanzas we already hold.
      if (conversation.some((existing) => existing.id === message.id)) {
        return state;
      }
      return { ...state, [key]: [...conversation, message] };
    }
    default:
      return state;
  }
}
