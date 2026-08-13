import type { Jid } from '../xmppTs.js';
import type { Action } from '../types.js';
import type { VCard } from '../state.js';
import { VCardActions, type VCardPayload } from '../reducers/vCard.js';

export function setVCard(jid: Jid, vCard: VCard): Action<VCardPayload> {
  return { payload: { jid, vCard }, type: VCardActions.SetVCard };
}
