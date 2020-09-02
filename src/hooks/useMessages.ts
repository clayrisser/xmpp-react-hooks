import Jid from '@xmpp-ts/jid';
import { Message } from '@xmpp-ts/message';
import { useSelector } from 'react-redux';
import { Roster, RosterItem } from '@xmpp-ts/roster';
import { State } from '../state';

export default function useMessages(
  jid?: Jid | null,
  roster?: Roster | null
): Message[] | [] {
  return useSelector((state: State) => {
    if (roster !== null && roster !== undefined) {
      const value: Message[] | null = roster.items.map((item: RosterItem) => {
        const result: any =
          state.messages[`${item.jid.local}@${item.jid.domain}`];
        if (result !== undefined) {
          return result[result.length - 1];
        }
        return null;
      });
      return value.filter((x: any) => x !== null);
    }
    if (jid !== null && jid !== undefined) {
      return state.messages[jid.bare().toString()];
    }
    return [];
  });
}
