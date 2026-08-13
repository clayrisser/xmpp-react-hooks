import { Jid } from '../xmppTs.js';
import { useSelector } from 'react-redux';
import type { State, VCard } from '../state.js';

/**
 * The cached vCard for `jid`, or undefined until one has been fetched.
 */
export default function useVCard(jid?: Jid | string | null): VCard | undefined {
  return useSelector((state: State) => {
    if (!jid) return undefined;
    const key = (typeof jid === 'string' ? new Jid(jid) : jid).bare().toString();
    return state.vCard[key];
  });
}
