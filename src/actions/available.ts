import type { Jid } from '../xmppTs.js';
import type { Action } from '../types.js';
import { AvailableActions } from '../reducers/available.js';

export function setAvailable(jid: Jid): Action<Jid> {
  return { payload: jid, type: AvailableActions.SetAvailable };
}

export function setUnavailable(jid: Jid): Action<Jid> {
  return { payload: jid, type: AvailableActions.SetUnavailable };
}
