import { Roster, RosterItem } from '@xmpp-ts/roster';
import { useSelector } from 'react-redux';
import { State, RosterItemState } from '../state';
import { parseJid } from '../helpers';

export default function useRoster(): Roster | null {
  const roster = useSelector((state: State) => state.roster);
  if (!roster) return null;
  return {
    ...roster,
    items: roster.items.map<RosterItem>((rosterItem: RosterItemState) => {
      return {
        ...rosterItem,
        jid: parseJid(rosterItem.jid)
      };
    })
  };
}
