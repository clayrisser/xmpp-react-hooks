import { PreloadedState } from 'redux';
import { Roster } from '@xmpp-ts/roster';

export interface State {
  roster: Roster | null;
}

export const defaultState: PreloadedState<State> = {
  roster: null
};
