import { JidObject } from '@xmpp-ts/jid';
import { PreloadedState } from 'redux';
import { Roster, RosterItem } from '@xmpp-ts/roster';

export interface RosterItemState extends Omit<RosterItem, 'jid'> {
  jid: JidObject;
}

export interface RosterState extends Omit<Roster, 'items'> {
  items: RosterItemState[];
}

export interface State {
  available: string[];
  roster: RosterState | null;
}

export const defaultState: PreloadedState<State> = {
  available: [],
  roster: null
};
