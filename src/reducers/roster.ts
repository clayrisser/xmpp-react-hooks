import { Jid } from '../xmppTs.js';
import type { Roster, RosterItem } from '@xmpp-ts/roster';
import type { Action } from '../types.js';
import type { RosterItemState, RosterState } from '../state.js';

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

const emptyRoster: RosterState = { items: [] };

export default function roster(
  state: RosterState = emptyRoster,
  { type, payload }: Action<Roster | RosterItem | Jid>
): RosterState {
  switch (type) {
    case RosterActions.SetRosterItem: {
      const item = payload as RosterItem;
      if (!item?.jid) return state;
      const jid = new Jid(item.jid);
      const items = state.items.map((rosterItem: RosterItemState) =>
        new Jid(rosterItem.jid).equals(jid)
          ? ({ ...rosterItem, ...item } as unknown as RosterItemState)
          : rosterItem
      );
      // A push for a contact we have not seen yet is an add, not an update.
      if (!items.some((rosterItem) => new Jid(rosterItem.jid).equals(jid))) {
        items.push(item as unknown as RosterItemState);
      }
      return { ...state, items };
    }
    case RosterActions.SetRoster: {
      const next = payload as Roster;
      return {
        ...(next.version ? { version: next.version } : {}),
        items: (next.items ?? []) as unknown as RosterItemState[]
      };
    }
    case RosterActions.RemoveRosterItem: {
      const jid = payload as Jid;
      return {
        ...state,
        items: state.items.filter(
          (rosterItem: RosterItemState) => !new Jid(rosterItem.jid).equals(jid)
        )
      };
    }
    default:
      return state;
  }
}
