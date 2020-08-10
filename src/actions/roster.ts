import Jid from '@xmpp-ts/jid';
import { RosterItem, Roster } from '@xmpp-ts/roster';
import { Action } from '../types';
import { RosterActions } from '../reducers/roster';

export function setRosterItem(rosterItem: RosterItem): Action<RosterItem> {
  return { payload: rosterItem, type: RosterActions.SetRosterItem };
}

export function removeRosterItem(jid: Jid): Action<Jid> {
  return { payload: jid, type: RosterActions.RemoveRosterItem };
}

export function setRoster(roster: Roster | null): Action<Roster | null> {
  return { payload: roster, type: RosterActions.SetRoster };
}
