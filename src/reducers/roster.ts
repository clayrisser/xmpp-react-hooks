import { Roster, RosterItem } from '@xmpp-ts/roster';
import { Action } from '../types';

export interface RosterPayload {
  item: RosterItem;
  version?: string;
}

export enum RosterActions {
  AddRosterItem = 'ADD_ROSTER_ITEM',
  RemoveRosterItem = 'REMOVE_ROSTER_ITEM',
  UpdateRosterItem = 'UPDATE_ROSTER_ITEM'
}

export default function rosterReducer(
  state: Roster | null = null,
  { type, payload }: Action<RosterPayload>
) {
  const version = state?.version || payload?.version;
  switch (type) {
    case RosterActions.AddRosterItem: {
      return {
        ...(version ? { version } : {}),
        items: [
          ...(state?.items || []),
          ...(payload?.item ? [payload.item] : [])
        ]
      };
    }
    case RosterActions.UpdateRosterItem: {
      return state;
    }
    case RosterActions.RemoveRosterItem: {
      return state;
    }
  }
  return state;
}
