import { JID } from '@xmpp/jid';
import { RosterItem } from '@xmpp-ts/roster';
import { Action } from '../types';
import { RosterActions } from '../reducers/roster';

export const addRosterItem = (rosterItem: RosterItem): Action<RosterItem> => ({
  payload: rosterItem,
  type: RosterActions.AddRosterItem
});

export const removeRosterItem = (jid: JID): Action<JID> => ({
  payload: jid,
  type: RosterActions.RemoveRosterItem
});

export const updateRosterItem = (
  rosterItem: RosterItem
): Action<RosterItem> => ({
  payload: rosterItem,
  type: RosterActions.UpdateRosterItem
});
