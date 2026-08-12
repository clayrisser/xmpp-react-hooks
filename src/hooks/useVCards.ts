import { useSelector } from 'react-redux';
import type { State, VCard, VCardData } from '../state.js';

/**
 * Every cached vCard, keyed by bare JID. Replaces the roster-shaped second
 * argument the old `useVCard` took, which returned partial records that had
 * to be index-matched back against the roster by the caller.
 */
export default function useVCards(): Record<string, VCard> {
  return useSelector((state: State): VCardData => state.vCard);
}
