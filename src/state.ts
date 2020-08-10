import { JidObject } from '@xmpp-ts/jid';
import { Message } from '@xmpp-ts/message';
import { PreloadedState } from 'redux';
import { Roster, RosterItem } from '@xmpp-ts/roster';

export interface Messages {
  [jid: string]: Message[];
}

export interface RosterItemState extends Omit<RosterItem, 'jid'> {
  jid: JidObject;
}

export interface RosterState extends Omit<Roster, 'items'> {
  items: RosterItemState[];
}

export interface State {
  available: string[];
  messages: Messages;
  roster: RosterState;
}

export const defaultState: PreloadedState<State> = {
  available: [],
  messages: {},
  roster: { items: [] }
};
