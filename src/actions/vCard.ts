import Jid from '@xmpp-ts/jid';
import { vCard } from '@xmpp-ts/vcard';
import { Action } from '../types';
import { VCardActions, vCardPayload } from '../reducers/vCard';

export function setVCard(jid: Jid, vCard: vCard): Action<vCardPayload> {
  return { payload: { jid, vCard }, type: VCardActions.SetVCard };
}
