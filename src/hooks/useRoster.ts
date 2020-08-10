import Jid from '@xmpp-ts/jid';
import { Roster, RosterItem } from '@xmpp-ts/roster';
import { useSelector } from 'react-redux';
import { State, RosterItemState } from '../state';

export default function useRoster(): Roster {
  const roster = useSelector((state: State) => state.roster);
  return {
    ...roster,
    items: roster.items.map<RosterItem>((rosterItem: RosterItemState) => {
      return {
        ...rosterItem,
        jid: new Jid(rosterItem.jid)
      };
    })
  };
}
