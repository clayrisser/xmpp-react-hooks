import { render, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import xml from '@xmpp/xml';
import { Provider as ReduxProvider } from 'react-redux';
import type { Store } from 'redux';
import Events from '../../src/Events.js';
import XmppContext from '../../src/contexts/xmpp.js';
import { createStore } from '../../src/store.js';
import type { State } from '../../src/state.js';
import { createFakeXmpp, rosterPush, rosterResult, type FakeXmpp } from './helpers/fakeClient.js';

function mount(fake: FakeXmpp) {
  const store = createStore();
  const view = render(
    <ReduxProvider store={store}>
      <XmppContext.Provider value={fake.xmpp}>
        <Events>
          <div>ready</div>
        </Events>
      </XmppContext.Provider>
    </ReduxProvider>
  );
  return { store: store as Store<State>, view };
}

describe('Events', () => {
  it('loads the roster into the store on mount', async () => {
    const fake = createFakeXmpp();
    fake.client.respondToIq = () => rosterResult([{ jid: 'bob@localhost', name: 'Bob' }], '3');
    const { store } = mount(fake);

    await waitFor(() => expect(store.getState().roster.items).toHaveLength(1));
    expect(store.getState().roster.version).toBe('3');
  });

  it('applies a server roster push', async () => {
    const fake = createFakeXmpp();
    fake.client.respondToIq = () => rosterResult([], '1');
    const { store } = mount(fake);
    await waitFor(() => expect(store.getState().roster.version).toBe('1'));

    fake.client.deliverIqSet(
      'jabber:iq:roster',
      'query',
      rosterPush({ jid: 'carol@localhost', name: 'Carol' })
    );

    await waitFor(() => expect(store.getState().roster.items).toHaveLength(1));
    expect(store.getState().roster.items[0]!.name).toBe('Carol');
  });

  it('removes a contact on a remove push', async () => {
    const fake = createFakeXmpp();
    fake.client.respondToIq = () => rosterResult([{ jid: 'bob@localhost', name: 'Bob' }]);
    const { store } = mount(fake);
    await waitFor(() => expect(store.getState().roster.items).toHaveLength(1));

    fake.client.deliverIqSet(
      'jabber:iq:roster',
      'query',
      rosterPush({ jid: 'bob@localhost', subscription: 'remove' })
    );

    await waitFor(() => expect(store.getState().roster.items).toHaveLength(0));
  });

  it('broadcasts available presence on mount', async () => {
    const fake = createFakeXmpp();
    fake.client.respondToIq = () => rosterResult([]);
    mount(fake);
    await waitFor(() =>
      expect(fake.client.sent.some((element) => element.name === 'presence')).toBe(true)
    );
  });

  it('tracks contact presence in the store', async () => {
    const fake = createFakeXmpp();
    fake.client.respondToIq = () => rosterResult([]);
    const { store } = mount(fake);

    fake.client.deliver(xml('presence', { from: 'bob@localhost/phone' }));
    await waitFor(() => expect(store.getState().available).toEqual(['bob@localhost']));

    fake.client.deliver(xml('presence', { from: 'bob@localhost/phone', type: 'unavailable' }));
    await waitFor(() => expect(store.getState().available).toEqual([]));
  });

  it('files an incoming message under the sender', async () => {
    const fake = createFakeXmpp('alice@localhost/test');
    fake.client.respondToIq = () => rosterResult([]);
    const { store } = mount(fake);

    fake.client.deliver(
      xml(
        'message',
        {
          from: 'bob@localhost/phone',
          id: 'm1',
          to: 'alice@localhost/test',
          xmlns: 'jabber:client'
        },
        xml('body', {}, 'hello')
      )
    );

    await waitFor(() => expect(store.getState().messages['bob@localhost']).toHaveLength(1));
    expect(store.getState().messages['bob@localhost']![0]!.body).toBe('hello');
  });

  it('files an outgoing message under the recipient', async () => {
    const fake = createFakeXmpp('alice@localhost/test');
    fake.client.respondToIq = () => rosterResult([]);
    const { store } = mount(fake);

    fake.client.emit(
      'send',
      xml(
        'message',
        {
          from: 'alice@localhost/test',
          id: 'm2',
          to: 'bob@localhost',
          xmlns: 'jabber:client'
        },
        xml('body', {}, 'hi bob')
      )
    );

    await waitFor(() => expect(store.getState().messages['bob@localhost']).toHaveLength(1));
  });

  it('sends unavailable presence when it unmounts', async () => {
    const fake = createFakeXmpp();
    fake.client.respondToIq = () => rosterResult([]);
    const { view } = mount(fake);
    await waitFor(() =>
      expect(fake.client.sent.some((element) => element.name === 'presence')).toBe(true)
    );

    view.unmount();

    await waitFor(() => expect(fake.client.lastSent('presence')?.attrs.type).toBe('unavailable'));
  });

  it('fetches one vCard per contact, and only when the roster changes', async () => {
    const fake = createFakeXmpp();
    let vCardRequests = 0;
    fake.client.respondToIq = (request) => {
      if (request.getChild('vCard')) {
        vCardRequests += 1;
        return xml(
          'iq',
          { type: 'result' },
          xml('vCard', { xmlns: 'vcard-temp' }, xml('FN', {}, 'Bob Bobson'))
        );
      }
      return rosterResult([{ jid: 'bob@localhost', name: 'Bob' }]);
    };

    const { store } = mount(fake);

    await waitFor(() => expect(store.getState().vCard['bob@localhost']).toBeDefined());
    expect(store.getState().vCard['bob@localhost']!.fullName).toBe('Bob Bobson');

    // The dependency-less effect this replaces re-fired on every render.
    const afterSettle = vCardRequests;
    await new Promise((resolve) => setTimeout(resolve, 150));
    expect(vCardRequests).toBe(afterSettle);
  });

  it('renders its children', () => {
    const fake = createFakeXmpp();
    fake.client.respondToIq = () => rosterResult([]);
    const { view } = mount(fake);
    expect(view.getByText('ready')).toBeTruthy();
  });
});
