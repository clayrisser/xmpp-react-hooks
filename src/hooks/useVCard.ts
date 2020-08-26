// import vCardService from '../services/vCard';
// import useServices from './useServices';

// export default function usevCardService(): vCardService | undefined {
//   const services = useServices();
//   return services?.vCard;
// }
import Jid from '@xmpp-ts/jid';
import { vCard } from '@xmpp-ts/vcard';
import { useSelector } from 'react-redux';
import { State } from '../state';

export default function useVCard(jid: Jid): vCard {
  return useSelector((state: State) => {
    console.log('jid.bare', jid.bare().toString());
    return state.vCard[jid.bare().toString()];
  });
}
