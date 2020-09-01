import Jid from '@xmpp-ts/jid';
import { VCard } from '@xmpp-ts/vcard';
import { Action } from '../types';
import { VCardData } from '../state';

export interface VCardPayload {
  jid: Jid;
  vCard: VCard;
}

export enum VCardActions {
  SetVCard = 'SET_VCARD'
}

export default function vcard(
  state: VCardData = {},
  { type, payload }: Action<VCardPayload>
) {
  switch (type) {
    case VCardActions.SetVCard: {
      const vCardData = Object.entries(state).reduce(
        (vCardData: VCardData, [key, value]: [string, VCard]) => {
          vCardData[key] = value;
          return vCardData;
        },
        {}
      );
      const { jid, vCard } = payload;
      const key = jid.bare().toString();

      if (!vCardData[key]) vCardData[key] = {};
      vCardData[key] = vCard;
      return vCardData;
    }
  }
  return state;
}
