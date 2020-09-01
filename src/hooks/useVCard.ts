import Jid from '@xmpp-ts/jid';
import { VCard } from '@xmpp-ts/vcard';
import { useSelector } from 'react-redux';
import { State } from '../state';

export default function useVCard(jid: Jid): VCard {
  return useSelector((state: State) => {
    return state.vCard[jid.bare().toString()];
  });
}
