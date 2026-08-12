import type { JidObject } from '@xmpp-ts/jid';
import type { Message } from '@xmpp-ts/message';
import type { Roster, RosterItem } from '@xmpp-ts/roster';

/**
 * What `VCardService.get()` actually resolves to. `@xmpp-ts/vcard`'s own
 * `VCard` interface declares only `profileImage`, so every other field the
 * client parses out of the stanza is invisible to consumers.
 */
export interface VCard {
  birthday?: string;
  country?: string;
  email?: string;
  fullName?: string;
  jabberID?: string;
  locality?: string;
  nickName?: string;
  phoneNumber?: string;
  pincode?: number | string;
  profileImage?: string;
  role?: string;
  title?: string;
}

export interface Messages {
  [jid: string]: Message[];
}

export interface RosterItemState extends Omit<RosterItem, 'jid'> {
  jid: JidObject;
}

export interface RosterState extends Omit<Roster, 'items'> {
  items: RosterItemState[];
}

export interface VCardData {
  [jid: string]: VCard;
}

export interface State {
  available: string[];
  messages: Messages;
  roster: RosterState;
  vCard: VCardData;
}

export const defaultState: State = {
  available: [],
  messages: {},
  roster: { items: [] },
  vCard: {}
};
