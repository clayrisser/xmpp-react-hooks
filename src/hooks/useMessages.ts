import type { Jid } from '../xmppTs.js';
import type { Message } from '@xmpp-ts/message';
import { useSelector } from 'react-redux';
import type { State } from '../state.js';

// Shared so the selector returns a stable reference for empty conversations.
const noMessages: Message[] = [];

/**
 * Messages exchanged with `jid`, oldest first. Empty until the first message
 * arrives — never undefined.
 */
export default function useMessages(jid?: Jid | null): Message[] {
  return useSelector((state: State) => {
    if (!jid) return noMessages;
    return state.messages[jid.bare().toString()] ?? noMessages;
  });
}
