import { useSelector } from 'react-redux';
import { Roster } from '@xmpp-ts/roster';
import { State } from '../state';

export default function useRoster(): Roster | null {
  return useSelector((state: State) => state.roster);
}
