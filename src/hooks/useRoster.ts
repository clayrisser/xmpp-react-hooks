import { Jid } from '../xmppTs.js';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import type { Roster, RosterItem } from '@xmpp-ts/roster';
import type { RosterItemState, State } from '../state.js';

/**
 * The contact list, kept in sync with server roster pushes.
 */
export default function useRoster(): Roster {
  const roster = useSelector((state: State) => state.roster);
  return useMemo(
    () => ({
      ...roster,
      items: roster.items.map<RosterItem>((rosterItem: RosterItemState) => ({
        ...rosterItem,
        jid: new Jid(rosterItem.jid)
      }))
    }),
    [roster]
  );
}
