import { Roster } from '@xmpp-ts/roster';

export interface State {
  roster: Roster | null;
}

export const defaultState: State = {
  roster: null
};
