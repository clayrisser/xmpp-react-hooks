import type { Jid } from '../xmppTs.js';
import type { Action } from '../types.js';
import type { VCard, VCardData } from '../state.js';

export interface VCardPayload {
  jid: Jid;
  vCard: VCard;
}

export enum VCardActions {
  SetVCard = 'SET_VCARD'
}

export default function vCard(
  state: VCardData = {},
  { type, payload }: Action<VCardPayload>
): VCardData {
  switch (type) {
    case VCardActions.SetVCard: {
      const { jid, vCard: card } = payload;
      return { ...state, [jid.bare().toString()]: card };
    }
    default:
      return state;
  }
}
