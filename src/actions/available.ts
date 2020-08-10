import Jid from '@xmpp-ts/jid';
import { Action } from '../types';
import { AvailableActions } from '../reducers/available';

export function setAvailable(jid: Jid): Action<Jid> {
  return { payload: jid, type: AvailableActions.SetAvailable };
}

export function setUnavailable(jid: Jid): Action<Jid> {
  return { payload: jid, type: AvailableActions.SetUnavailable };
}
