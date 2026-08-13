import type { Jid } from '../xmppTs.js';
import type { Roster, RosterItem } from '@xmpp-ts/roster';
import type { Action } from '../types.js';
import { RosterActions } from '../reducers/roster.js';

export function setRosterItem(rosterItem: RosterItem): Action<RosterItem> {
  return { payload: rosterItem, type: RosterActions.SetRosterItem };
}

export function removeRosterItem(jid: Jid): Action<Jid> {
  return { payload: jid, type: RosterActions.RemoveRosterItem };
}

export function setRoster(roster: Roster): Action<Roster> {
  return { payload: roster, type: RosterActions.SetRoster };
}
