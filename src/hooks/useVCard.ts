// import Jid from '@xmpp-ts/jid';
// import { VCard } from '@xmpp-ts/vcard';
// import { useSelector } from 'react-redux';
// import { State } from '../state';

// export default function useVCard(jid: Jid): VCard {
//   return useSelector((state: State) => {
//     return state.vCard[jid.bare().toString()];
//   });
// }
import Jid from '@xmpp-ts/jid';
import { VCard } from '@xmpp-ts/vcard';
import { useSelector } from 'react-redux';
import { Roster, RosterItem } from '@xmpp-ts/roster';
import { State } from '../state';

export interface Result {
  id?: string;
  profileImage?: string;
  birthday?: string;
  fullName?: string;
  email?: string;
  locality?: string;
  country?: string;
  nickName?: string;
  title?: string;
  role?: string;
  phoneNumber?: string;
  jabberID?: string;
  pincode?: number;
}

export default function useVCard(
  jid?: Jid | null,
  roster?: Roster | null
): Result[] | [] | VCard[] {
  return useSelector((state: State) => {
    if (roster !== null && roster !== undefined) {
      const value: Result[] | null = roster.items.map((item: RosterItem) => {
        const result: any = state.vCard[`${item.jid.local}@${item.jid.domain}`];

        return {
          id: item.jid.local,
          profileImage: result === undefined ? '' : result.profileImage
        };
      });
      return value;
    }
    if (jid !== null && jid !== undefined) {
      return [state.vCard[jid.bare().toString()]];
    }
    return [];
  });
}
