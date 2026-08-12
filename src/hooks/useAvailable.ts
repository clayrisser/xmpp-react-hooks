import { Jid } from '../xmppTs.js';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import type { State } from '../state.js';

/**
 * Bare JIDs of contacts currently broadcasting available presence.
 */
export default function useAvailable(): Jid[] {
  const available = useSelector((state: State) => state.available);
  // Mapping inside the selector would hand react-redux a new array on every
  // store notification and re-render forever.
  return useMemo(() => available.map((jid: string) => new Jid(jid)), [available]);
}
