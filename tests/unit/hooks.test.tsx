import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { Message } from '@xmpp-ts/message';
import { RosterSubscription, type RosterItem } from '@xmpp-ts/roster';
import xml from '@xmpp/xml';
import { addMessage, setAvailable, setRoster, setVCard } from '../../src/actions/index.js';
import {
  useAvailable,
  useMessageService,
  useMessages,
  usePresenceService,
  useRoster,
  useRosterService,
  useServices,
  useStatus,
  useVCard,
  useVCardService,
  useVCards,
  useXmpp,
  useXmppClient
} from '../../src/hooks/index.js';
import { Jid } from '../../src/xmppTs.js';
import { createFakeXmpp } from './helpers/fakeClient.js';
import { createWrapper } from './helpers/render.js';

const bob = new Jid('bob@localhost');

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

describe('useAvailable', () => {
  it('is empty before any presence arrives', () => {
    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useAvailable(), { wrapper });
    expect(result.current).toEqual([]);
  });

  it('reports contacts as Jid instances', () => {
    const { store, wrapper } = createWrapper();
    const { result } = renderHook(() => useAvailable(), { wrapper });
    act(() => {
      store.dispatch(setAvailable(new Jid('bob@localhost/phone')));
    });
    expect(result.current).toHaveLength(1);
    expect(result.current[0]!.bare().toString()).toBe('bob@localhost');
  });

  it('returns a stable reference while the store is unchanged', () => {
    const { store, wrapper } = createWrapper();
    const { result, rerender } = renderHook(() => useAvailable(), { wrapper });
    act(() => {
      store.dispatch(setAvailable(bob));
    });
    const first = result.current;
    rerender();
    // A fresh array on every render would loop forever under react-redux.
    expect(result.current).toBe(first);
  });
});

describe('useMessages', () => {
  it('returns an empty array for an unknown conversation', () => {
    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useMessages(bob), { wrapper });
    expect(result.current).toEqual([]);
  });

  it('returns an empty array when no jid is given', () => {
    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useMessages(undefined), { wrapper });
    expect(result.current).toEqual([]);
  });

  it('returns the conversation once messages arrive', () => {
    const { store, wrapper } = createWrapper();
    const { result } = renderHook(() => useMessages(bob), { wrapper });
    act(() => {
      store.dispatch(addMessage(bob, { body: 'hi', from: bob, id: '1' } as Message));
    });
    expect(result.current).toHaveLength(1);
    expect(result.current[0]!.body).toBe('hi');
  });
});

describe('useRoster', () => {
  it('starts with no contacts', () => {
    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useRoster(), { wrapper });
    expect(result.current.items).toEqual([]);
  });

  it('rehydrates plain jid objects into Jid instances', () => {
    const { store, wrapper } = createWrapper();
    const { result } = renderHook(() => useRoster(), { wrapper });
    act(() => {
      store.dispatch(setRoster({ items: [rosterItem(bob, 'Bob')] }));
    });
    expect(result.current.items[0]!.jid.bare().toString()).toBe('bob@localhost');
    expect(typeof result.current.items[0]!.jid.bare).toBe('function');
  });

  it('returns a stable reference while the store is unchanged', () => {
    const { wrapper } = createWrapper();
    const { result, rerender } = renderHook(() => useRoster(), { wrapper });
    const first = result.current;
    rerender();
    expect(result.current).toBe(first);
  });
});

describe('useVCard and useVCards', () => {
  it('is undefined before a card is fetched', () => {
    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useVCard(bob), { wrapper });
    expect(result.current).toBeUndefined();
  });

  it('accepts a jid string as well as a Jid', () => {
    const { store, wrapper } = createWrapper();
    const { result } = renderHook(() => useVCard('bob@localhost'), { wrapper });
    act(() => {
      store.dispatch(setVCard(bob, { profileImage: 'abc' }));
    });
    expect(result.current).toEqual({ profileImage: 'abc' });
  });

  it('is undefined when no jid is given', () => {
    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useVCard(null), { wrapper });
    expect(result.current).toBeUndefined();
  });

  it('exposes every cached card by bare jid', () => {
    const { store, wrapper } = createWrapper();
    const { result } = renderHook(() => useVCards(), { wrapper });
    act(() => {
      store.dispatch(setVCard(bob, { profileImage: 'abc' }));
    });
    expect(result.current).toEqual({ 'bob@localhost': { profileImage: 'abc' } });
  });
});

describe('context hooks', () => {
  it('return undefined with no provider above them', () => {
    const { wrapper } = createWrapper();
    const { result } = renderHook(
      () => ({
        client: useXmppClient(),
        message: useMessageService(),
        presence: usePresenceService(),
        roster: useRosterService(),
        services: useServices(),
        vCard: useVCardService(),
        xmpp: useXmpp()
      }),
      { wrapper }
    );
    expect(Object.values(result.current).every((v) => v === undefined)).toBe(true);
  });

  it('expose the services hanging off the provided Xmpp instance', () => {
    const { client, xmpp } = createFakeXmpp();
    const { wrapper } = createWrapper({ xmpp });
    const { result } = renderHook(
      () => ({
        client: useXmppClient(),
        message: useMessageService(),
        presence: usePresenceService(),
        roster: useRosterService(),
        vCard: useVCardService()
      }),
      { wrapper }
    );
    expect(result.current.client).toBe(client);
    expect(result.current.message).toBe(xmpp.services!.message);
    expect(result.current.presence).toBe(xmpp.services!.presence);
    expect(result.current.roster).toBe(xmpp.services!.roster);
    expect(result.current.vCard).toBe(xmpp.services!.vCard);
  });
});

describe('useStatus', () => {
  it('reports offline with no client', () => {
    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useStatus(), { wrapper });
    expect(result.current).toEqual({ isOnline: false, isReady: false });
  });

  it('reflects the connection state of the provided client', () => {
    const { xmpp } = createFakeXmpp();
    const { wrapper } = createWrapper({ xmpp });
    const { result } = renderHook(() => useStatus(), { wrapper });
    expect(result.current.isOnline).toBe(true);
    expect(result.current.isReady).toBe(true);
  });

  it('keeps isReady latched when the connection drops', async () => {
    const { client, xmpp } = createFakeXmpp();
    const { wrapper } = createWrapper({ xmpp });
    const { result } = renderHook(() => useStatus(), { wrapper });

    act(() => {
      client.emit('offline');
    });

    // The old implementation closed over the initial `status`, so repeated
    // transitions wrote back stale values.
    await waitFor(() => expect(result.current.isOnline).toBe(false));
    expect(result.current.isReady).toBe(true);

    act(() => {
      client.emit('online', client.jid);
    });
    await waitFor(() => expect(result.current.isOnline).toBe(true));
  });

  it('surfaces client errors instead of letting them escape', async () => {
    const { client, xmpp } = createFakeXmpp();
    const { wrapper } = createWrapper({ xmpp });
    const { result } = renderHook(() => useStatus(), { wrapper });

    act(() => {
      client.emit('error', new Error('auth failed'));
    });

    await waitFor(() => expect(result.current.error?.message).toBe('auth failed'));
  });
});

describe('hooks against live service traffic', () => {
  it('does not throw when a presence with no to attribute arrives', () => {
    const { client, xmpp } = createFakeXmpp();
    const { wrapper } = createWrapper({ xmpp });
    renderHook(() => useStatus(), { wrapper });
    expect(() => client.deliver(xml('presence', { from: 'bob@localhost/phone' }))).not.toThrow();
  });
});
