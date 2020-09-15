import Jid from '@xmpp-ts/jid';
import { Message } from '@xmpp-ts/message';
import { useSelector } from 'react-redux';
// import { Roster, RosterItem } from '@xmpp-ts/roster';
import { State } from '../state';

export default function useMessages(jid: Jid): Message[] {
  return useSelector((state: State) => {
    return state.messages[jid.bare().toString()];
  });
}
