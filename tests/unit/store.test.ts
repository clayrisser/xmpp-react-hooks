import { describe, expect, it } from 'vitest';
import { createPersistorStore, createStore } from '../../src/store.js';
import { defaultState } from '../../src/state.js';
import { setAvailable, setRosterItem } from '../../src/actions/index.js';
import { Jid } from '../../src/xmppTs.js';
import { RosterSubscription, type RosterItem } from '@xmpp-ts/roster';

function memoryStorage() {
  const data = new Map<string, string>();
  return {
    getItem: async (key: string) => data.get(key) ?? null,
    removeItem: async (key: string) => void data.delete(key),
    setItem: async (key: string, value: string) => void data.set(key, value)
  };
}

const bob: RosterItem = {
  approved: false,
  ask: false,
  groups: [],
  jid: new Jid('bob@localhost'),
  name: 'Bob',
  subscription: RosterSubscription.NONE
};

describe('createStore', () => {
  it('starts from the documented default state', () => {
    expect(createStore().getState()).toEqual(defaultState);
  });

  it('applies dispatched actions', () => {
    const store = createStore();
    store.dispatch(setRosterItem(bob));
    expect(store.getState().roster.items).toHaveLength(1);
  });
});

describe('createPersistorStore', () => {
  it('produces a working store and persistor', async () => {
    const { persistor, store } = createPersistorStore(memoryStorage(), 'test');
    expect(typeof persistor.persist).toBe('function');

    store.dispatch(setRosterItem(bob));
    expect(store.getState().roster.items).toHaveLength(1);
  });

  it('rehydrates the roster from storage but not presence', async () => {
    const storage = memoryStorage();
    const first = createPersistorStore(storage, 'rehydrate');
    first.store.dispatch(setRosterItem(bob));
    first.store.dispatch(setAvailable(new Jid('bob@localhost')));
    await new Promise((resolve) => setTimeout(resolve, 50));

    const second = createPersistorStore(storage, 'rehydrate');
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(second.store.getState().roster.items).toHaveLength(1);
    // `available` is blacklisted: who was online last session says nothing
    // about who is online now.
    expect(second.store.getState().available).toEqual([]);
  });

  it('falls back to a default key', () => {
    const { store } = createPersistorStore(memoryStorage());
    expect(store.getState().roster.items).toEqual([]);
  });
});
