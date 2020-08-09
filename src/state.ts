import { PreloadedState } from 'redux';
import { Roster, RosterItem } from '@xmpp-ts/roster';

export interface JIDState {
  _domain: string;
  _local: string;
  _resource: string;
}

export interface RosterItemState extends Omit<RosterItem, 'jid'> {
  jid: JIDState;
}

export interface RosterState extends Omit<Roster, 'items'> {
  items: RosterItemState[];
}

export interface State {
  roster: RosterState | null;
}

export const defaultState: PreloadedState<State> = {
  roster: null
};
