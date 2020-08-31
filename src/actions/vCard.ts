import Jid from '@xmpp-ts/jid';
import { VCard } from '@xmpp-ts/vcard';
import { Action } from '../types';
import { VCardActions, VCardPayload } from '../reducers/vCard';

export function setVCard(jid: Jid, vCard: VCard): Action<VCardPayload> {
  return { payload: { jid, vCard }, type: VCardActions.SetVCard };
}
