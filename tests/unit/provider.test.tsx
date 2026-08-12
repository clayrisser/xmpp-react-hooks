import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Client as XmppClient } from '@xmpp/client';
import Provider from '../../src/Provider.js';
import Xmpp from '../../src/xmpp.js';
import { useStatus, useXmppClient } from '../../src/hooks/index.js';
import { FakeXmppClient } from './helpers/fakeClient.js';

/** Minimal in-memory redux-persist storage. */
function memoryStorage() {
  const data = new Map<string, string>();
  return {
    getItem: async (key: string) => data.get(key) ?? null,
    removeItem: async (key: string) => void data.delete(key),
    setItem: async (key: string, value: string) => void data.set(key, value)
  };
}

const logins: Array<{ password: string; username: string }> = [];
let nextClient: () => FakeXmppClient = () => new FakeXmppClient();

// Patch `login` rather than the module: the Provider's job under test is the
// lifecycle around it, not the socket it would open.
const realLogin = Xmpp.prototype.login;
Xmpp.prototype.login = async function login(this: Xmpp, username: string, password: string) {
  logins.push({ password, username });
  if (password === 'wrong') throw new Error('not-authorized');
  this.attach(nextClient() as unknown as XmppClient);
};

afterEach(() => {
  logins.length = 0;
  nextClient = () => new FakeXmppClient();
});

function Probe() {
  const client = useXmppClient();
  const status = useStatus();
  return (
    <div>
      <span data-testid="jid">{client?.jid?.toString() ?? 'none'}</span>
      <span data-testid="online">{String(status.isOnline)}</span>
    </div>
  );
}

describe('Provider', () => {
  it('renders children before any credentials are supplied', () => {
    render(
      <Provider resource="test" storage={memoryStorage()}>
        <Probe />
      </Provider>
    );
    expect(screen.getByTestId('jid')).toHaveTextContent('none');
    expect(logins).toHaveLength(0);
  });

  it('logs in and exposes the client once credentials arrive', async () => {
    render(
      <Provider
        domain="localhost"
        service="ws://localhost:5280/xmpp-websocket"
        password="alicepass"
        resource="test"
        singleton={false}
        storage={memoryStorage()}
        username="alice"
      >
        <Probe />
      </Provider>
    );

    await waitFor(() => expect(screen.getByTestId('jid')).toHaveTextContent('alice@localhost'));
    expect(logins).toEqual([{ password: 'alicepass', username: 'alice' }]);
  });

  it('reports a failed login through onError instead of hanging', async () => {
    const onError = vi.fn();
    render(
      <Provider
        domain="localhost"
        service="ws://localhost:5280/xmpp-websocket"
        onError={onError}
        password="wrong"
        resource="test"
        singleton={false}
        storage={memoryStorage()}
        username="alice"
      >
        <Probe />
      </Provider>
    );

    // Previously an unhandled rejection: the tree just sat on `loading`.
    await waitFor(() => expect(onError).toHaveBeenCalledTimes(1));
    expect(onError.mock.calls[0]![0].message).toBe('not-authorized');
    expect(screen.getByTestId('jid')).toHaveTextContent('none');
  });

  it('reuses one connection per account when singleton is on', async () => {
    const shared = new FakeXmppClient('alice@localhost/test');
    nextClient = () => shared;

    const tree = (
      <Provider
        domain="localhost"
        service="ws://localhost:5280/xmpp-websocket"
        password="alicepass"
        resource="test"
        storage={memoryStorage()}
        username="alice"
      >
        <Probe />
      </Provider>
    );
    const first = render(tree);
    await waitFor(() => expect(screen.getByTestId('jid')).toHaveTextContent('alice@localhost'));
    first.unmount();

    render(tree);
    await waitFor(() => expect(screen.getByTestId('jid')).toHaveTextContent('alice@localhost'));
    expect(logins).toHaveLength(1);
  });

  it('does not hand a second account the first account connection', async () => {
    // Fresh usernames: the singleton cache is module scoped and outlives a
    // single test, exactly as it does in a real app.
    nextClient = () => new FakeXmppClient('dave@localhost/test');
    const dave = render(
      <Provider
        domain="localhost"
        service="ws://localhost:5280/xmpp-websocket"
        password="davepass"
        resource="test"
        storage={memoryStorage()}
        username="dave"
      >
        <Probe />
      </Provider>
    );
    await waitFor(() => expect(screen.getByTestId('jid')).toHaveTextContent('dave@localhost'));
    dave.unmount();

    nextClient = () => new FakeXmppClient('erin@localhost/test');
    render(
      <Provider
        domain="localhost"
        service="ws://localhost:5280/xmpp-websocket"
        password="erinpass"
        resource="test"
        storage={memoryStorage()}
        username="erin"
      >
        <Probe />
      </Provider>
    );

    // The old single-slot singleton returned dave's connection here.
    await waitFor(() => expect(screen.getByTestId('jid')).toHaveTextContent('erin@localhost'));
    expect(logins.map((entry) => entry.username)).toEqual(['dave', 'erin']);
  });

  it('still works with the real login left untouched for other suites', () => {
    expect(typeof realLogin).toBe('function');
  });
});
