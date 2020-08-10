import Jid from '@xmpp-ts/jid';
import { RosterItem } from '@xmpp-ts/roster';
import { Action } from '../types';
import { RosterState, RosterItemState } from '../state';

export interface RosterPayload {
  item?: RosterItem;
  items: RosterItem[];
  version?: string;
}

export enum RosterActions {
  RemoveRosterItem = 'REMOVE_ROSTER_ITEM',
  SetRoster = 'SET_ROSTER',
  SetRosterItem = 'SET_ROSTER_ITEM'
}

export default function roster(
  state: RosterState | null = null,
  { type, payload }: Action<RosterPayload | RosterItem | Jid>
) {
  switch (type) {
    case RosterActions.SetRosterItem: {
      const { jid } = payload as RosterItem;
      const roster: RosterState | null = state ? { ...state } : null;
      const rosterItem: RosterItemState | undefined = roster?.items.find(
        (rosterItem: RosterItemState) =>
          jid && new Jid(rosterItem?.jid).equals(jid)
      );
      if (rosterItem) {
        Object.assign(rosterItem, payload);
        return roster;
      }
      return {
        ...(state?.version ? { version: state.version } : {}),
        items: [
          ...(state?.items || []),
          ...((payload as RosterItem) ? [payload as RosterItem] : [])
        ]
      };
    }
    case RosterActions.SetRoster: {
      return payload;
    }
    case RosterActions.RemoveRosterItem: {
      const jid = payload as Jid;
      return {
        version: state?.version,
        items: state?.items.filter((rosterItem: RosterItemState) => {
          return !new Jid(rosterItem.jid).equals(jid);
        })
      };
    }
  }
  return state;
}
