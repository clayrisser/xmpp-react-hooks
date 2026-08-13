import { describe, expect, it } from 'vitest';
import type { Message } from '@xmpp-ts/message';
import type { RosterItem } from '@xmpp-ts/roster';
import { RosterSubscription } from '@xmpp-ts/roster';
import available, { AvailableActions } from '../../src/reducers/available.js';
import messages from '../../src/reducers/messages.js';
import roster from '../../src/reducers/roster.js';
import vCard from '../../src/reducers/vCard.js';
import reducers from '../../src/reducers/index.js';
import {
  addMessage,
  removeRosterItem,
  setAvailable,
  setRoster,
  setRosterItem,
  setUnavailable,
  setVCard
} from '../../src/actions/index.js';
import { Jid } from '../../src/xmppTs.js';

const bob = new Jid('bob@localhost');
const carol = new Jid('carol@localhost');

function rosterItem(jid: Jid, name = ''): RosterItem {
  return {
    approved: false,
    ask: false,
    groups: [],
    jid,
    name,
    subscription: RosterSubscription.NONE
  };
}

function message(id: string, body: string): Message {
  return { body, from: bob, id, to: new Jid('alice@localhost') } as Message;
}

describe('available reducer', () => {
  it('starts empty and ignores unknown actions', () => {
    expect(available(undefined, { payload: bob, type: 'NOPE' })).toEqual([]);
  });

  it('adds a bare jid, deduplicating full jids', () => {
    let state = available(undefined, setAvailable(new Jid('bob@localhost/a')));
    state = available(state, setAvailable(new Jid('bob@localhost/b')));
    expect(state).toEqual(['bob@localhost']);
  });

  it('removes on unavailable', () => {
    const state = available(['bob@localhost'], setUnavailable(bob));
    expect(state).toEqual([]);
  });

  it('exposes its action types', () => {
    expect(AvailableActions.SetAvailable).toBe('SET_AVAILABLE');
  });
});

describe('messages reducer', () => {
  it('groups messages under the peer bare jid', () => {
    const state = messages(undefined, addMessage(bob, message('1', 'hi')));
    expect(state['bob@localhost']).toHaveLength(1);
    expect(state['bob@localhost']![0]!.body).toBe('hi');
  });

  it('appends in order', () => {
    let state = messages(undefined, addMessage(bob, message('1', 'one')));
    state = messages(state, addMessage(bob, message('2', 'two')));
    expect(state['bob@localhost']!.map((m) => m.body)).toEqual(['one', 'two']);
  });

  it('drops a replayed message with the same id', () => {
    const first = messages(undefined, addMessage(bob, message('1', 'one')));
    const second = messages(first, addMessage(bob, message('1', 'one')));
    expect(second).toBe(first);
    expect(second['bob@localhost']).toHaveLength(1);
  });

  it('does not mutate the previous state', () => {
    const first = messages(undefined, addMessage(bob, message('1', 'one')));
    const second = messages(first, addMessage(bob, message('2', 'two')));
    expect(first['bob@localhost']).toHaveLength(1);
    expect(second['bob@localhost']).toHaveLength(2);
  });

  it('keeps separate conversations apart', () => {
    let state = messages(undefined, addMessage(bob, message('1', 'to bob')));
    state = messages(state, addMessage(carol, message('2', 'to carol')));
    expect(Object.keys(state).toSorted()).toEqual(['bob@localhost', 'carol@localhost']);
  });
});

describe('roster reducer', () => {
  it('replaces the whole roster on setRoster', () => {
    const state = roster(undefined, setRoster({ items: [rosterItem(bob, 'Bob')], version: '4' }));
    expect(state.version).toBe('4');
    expect(state.items).toHaveLength(1);
  });

  it('adds an unknown contact on setRosterItem', () => {
    const state = roster(undefined, setRosterItem(rosterItem(bob, 'Bob')));
    expect(state.items).toHaveLength(1);
    expect(state.items[0]!.name).toBe('Bob');
  });

  it('updates an existing contact without duplicating it', () => {
    const first = roster(undefined, setRosterItem(rosterItem(bob, 'Bob')));
    const second = roster(first, setRosterItem(rosterItem(bob, 'Bobby')));
    expect(second.items).toHaveLength(1);
    expect(second.items[0]!.name).toBe('Bobby');
  });

  it('updates immutably, leaving the previous state untouched', () => {
    const first = roster(undefined, setRosterItem(rosterItem(bob, 'Bob')));
    const second = roster(first, setRosterItem(rosterItem(bob, 'Bobby')));
    expect(first.items[0]!.name).toBe('Bob');
    expect(second.items).not.toBe(first.items);
  });

  it('removes a contact', () => {
    const first = roster(undefined, setRoster({ items: [rosterItem(bob), rosterItem(carol)] }));
    const second = roster(first, removeRosterItem(bob));
    expect(second.items).toHaveLength(1);
    expect(new Jid(second.items[0]!.jid).bare().toString()).toBe('carol@localhost');
  });

  it('ignores a set with no jid', () => {
    const state = roster(undefined, setRosterItem({} as RosterItem));
    expect(state.items).toHaveLength(0);
  });
});

describe('vCard reducer', () => {
  it('stores a card under the bare jid', () => {
    const state = vCard(
      undefined,
      setVCard(new Jid('bob@localhost/phone'), { profileImage: 'abc' })
    );
    expect(state['bob@localhost']).toEqual({ profileImage: 'abc' });
  });

  it('replaces an existing card immutably', () => {
    const first = vCard(undefined, setVCard(bob, { profileImage: 'a' }));
    const second = vCard(first, setVCard(bob, { profileImage: 'b' }));
    expect(first['bob@localhost']!.profileImage).toBe('a');
    expect(second['bob@localhost']!.profileImage).toBe('b');
  });
});

describe('root reducer', () => {
  it('produces the documented default shape', () => {
    const state = reducers(undefined, { type: '@@INIT' } as never);
    expect(state).toEqual({
      available: [],
      messages: {},
      roster: { items: [] },
      vCard: {}
    });
  });
});
