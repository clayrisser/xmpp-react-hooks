import Jid from '@xmpp-ts/jid';
import { vCard } from '@xmpp-ts/vcard';
import { Action } from '../types';
import { RosterState, RosterItemState, vCardData } from '../state';

export interface vCardPayload {
  // item?: RosterItem;
  // items: RosterItem[];
  // version?: string;
  jid: Jid;
  vCard: vCard;
}

export enum VCardActions {
  SetVCard = 'SET_VCARD'
}

export default function vcard(
  state: vCardData = {},
  { type, payload }: Action<vCardPayload>
) {
  switch (type) {
    case VCardActions.SetVCard: {
      const vcard_data = Object.entries(state).reduce(
        (vcard_data: vCardData, [key, value]: [string, vCard]) => {
          console.log('valueee', value);
          vcard_data[key] = value;
          return vcard_data;
        },
        {}
      );
      const { jid, vCard } = payload;
      const key = jid.bare().toString();

      console.log('key', key, vcard_data);
      if (!vcard_data[key]) vcard_data[key] = {};
      // if (
      //   vcard_data[key].some(
      //     (state_message) => state_message.profileImage === vCard.profileImage
      //   )
      // ) {
      //   return vcard_data;
      // }
      vcard_data[key] = vCard;
      console.log('vcard_datassss', vcard_data);
      return vcard_data;
      //   const { jid } = payload as RosterItem;
      //   const roster = { ...state };
      //   const rosterItem: RosterItemState | undefined = roster?.items.find(
      //     (rosterItem: RosterItemState) =>
      //       jid && new Jid(rosterItem?.jid).equals(jid)
      //   );
      //   if (rosterItem) {
      //     Object.assign(rosterItem, payload);
      //     return roster;
      //   }
      //   return {
      //     ...(state?.version ? { version: state.version } : {}),
      //     items: [
      //       ...(state?.items || []),
      //       ...((payload as RosterItem) ? [payload as RosterItem] : [])
      //     ]
      //   };
    }
  }
  return state;
}
