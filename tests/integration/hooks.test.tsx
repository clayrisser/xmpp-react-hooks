import { render, screen, waitFor } from '@testing-library/react';
import { beforeAll, describe, expect, it } from 'vitest';
import { useState } from 'react';
import type { ReactNode } from 'react';
import Provider from '../../src/Provider.js';
import Xmpp from '../../src/xmpp.js';
import { Jid } from '../../src/xmppTs.js';
import {
  useAvailable,
  useMessageService,
  useMessages,
  usePresenceService,
  useRoster,
  useRosterService,
  useStatus
} from '../../src/hooks/index.js';
import { accounts, bareJid, service, waitForServer, xmppDomain } from './helpers/server.js';

function memoryStorage() {
  const data = new Map<string, string>();
  return {
    getItem: async (key: string) => data.get(key) ?? null,
    removeItem: async (key: string) => void data.delete(key),
    setItem: async (key: string, value: string) => void data.set(key, value)
  };
}

function Session({
  account,
  children,
  resource
}: {
  account: { password: string; username: string };
  children: ReactNode;
  resource: string;
}) {
  return (
    <Provider
      domain={xmppDomain}
      password={account.password}
      resource={resource}
      service={service}
      singleton={false}
      storage={memoryStorage()}
      username={account.username}
    >
      {children}
    </Provider>
  );
}

/** Wipes roster and subscription state so a warm container starts clean. */
async function resetAccount(account: { password: string; username: string }) {
  const xmpp = new Xmpp({ domain: xmppDomain, resource: 'reset', service });
  xmpp.onError(() => {});
  await xmpp.login(account.username, account.password);
  await xmpp.start();
  const roster = await xmpp.services!.roster.get();
  for (const item of roster?.items ?? []) {
    await xmpp.services!.roster.remove(item.jid).catch(() => {});
  }
  await xmpp.stop();
}

describe('hooks against a live server', () => {
  beforeAll(async () => {
    await waitForServer();
    await resetAccount(accounts.alice);
    await resetAccount(accounts.bob);
  });

  it('reports the connection as online once the provider logs in', async () => {
    function Probe() {
      const status = useStatus();
      return <span data-testid="online">{String(status.isOnline)}</span>;
    }

    render(
      <Session account={accounts.alice} resource="hooks-1">
        <Probe />
      </Session>
    );

    await waitFor(() => expect(screen.getByTestId('online')).toHaveTextContent('true'), {
      timeout: 15000
    });
  });

  it('surfaces a bad password rather than hanging forever', async () => {
    let captured: Error | undefined;
    render(
      <Provider
        domain={xmppDomain}
        onError={(error) => {
          captured = error;
        }}
        password="nope"
        resource="hooks-2"
        service={service}
        singleton={false}
        storage={memoryStorage()}
        username="alice"
      >
        <span data-testid="mounted">mounted</span>
      </Provider>
    );

    await waitFor(() => expect(captured).toBeDefined(), { timeout: 15000 });
    expect(captured!.message).toMatch(/not-authorized/);
    expect(screen.getByTestId('mounted')).toBeInTheDocument();
  });

  it('fills useRoster from the server and keeps it in sync with pushes', async () => {
    function Probe() {
      const roster = useRoster();
      const rosterService = useRosterService();
      const status = useStatus();
      const [added, setAdded] = useState(false);

      if (status.isReady && rosterService && !added) {
        setAdded(true);
        void rosterService.set({ jid: new Jid(bareJid('bob')), name: 'Bob' });
      }

      return (
        <span data-testid="roster">
          {roster.items.map((item) => `${item.jid.bare().toString()}:${item.name}`).join('|')}
        </span>
      );
    }

    render(
      <Session account={accounts.alice} resource="hooks-3">
        <Probe />
      </Session>
    );

    // The roster only lands here because the push handler accepts a stanza
    // with no `from` — the fix this suite exists to prove.
    await waitFor(
      () => expect(screen.getByTestId('roster')).toHaveTextContent(`${bareJid('bob')}:Bob`),
      { timeout: 20000 }
    );
  });

  it('delivers a message between two live sessions and stores both sides', async () => {
    function Sender() {
      const messageService = useMessageService();
      const presenceService = usePresenceService();
      const status = useStatus();
      const messages = useMessages(new Jid(bareJid('bob')));
      const [sent, setSent] = useState(false);

      if (status.isReady && messageService && presenceService && !sent) {
        setSent(true);
        setTimeout(() => {
          messageService.send({
            body: 'live round trip',
            to: new Jid(bareJid('bob'))
          });
        }, 1500);
      }

      return <span data-testid="sent">{messages.map((message) => message.body).join('|')}</span>;
    }

    function Receiver() {
      const presenceService = usePresenceService();
      const status = useStatus();
      const messages = useMessages(new Jid(bareJid('alice')));
      if (status.isReady) presenceService?.available();
      return (
        <span data-testid="received">{messages.map((message) => message.body).join('|')}</span>
      );
    }

    render(
      <>
        <Session account={accounts.bob} resource="hooks-4b">
          <Receiver />
        </Session>
        <Session account={accounts.alice} resource="hooks-4a">
          <Sender />
        </Session>
      </>
    );

    await waitFor(
      () => expect(screen.getByTestId('received')).toHaveTextContent('live round trip'),
      { timeout: 20000 }
    );
    // The sender files its own outgoing message under the recipient.
    expect(screen.getByTestId('sent')).toHaveTextContent('live round trip');
  });

  it('tracks a contact coming online through useAvailable', async () => {
    function AliceProbe() {
      const available = useAvailable();
      const presenceService = usePresenceService();
      const status = useStatus();
      const [subscribed, setSubscribed] = useState(false);

      if (status.isReady && presenceService && !subscribed) {
        setSubscribed(true);
        presenceService.send({
          to: new Jid(bareJid('bob')),
          type: 'subscribe' as never
        });
      }

      return (
        <span data-testid="available">{available.map((jid) => jid.toString()).join('|')}</span>
      );
    }

    function BobProbe() {
      const presenceService = usePresenceService();
      const status = useStatus();
      if (status.isReady) presenceService?.available();
      return <span data-testid="bob-ready">{String(status.isReady)}</span>;
    }

    render(
      <>
        <Session account={accounts.alice} resource="hooks-5a">
          <AliceProbe />
        </Session>
        <Session account={accounts.bob} resource="hooks-5b">
          <BobProbe />
        </Session>
      </>
    );

    await waitFor(() => expect(screen.getByTestId('available')).toHaveTextContent(bareJid('bob')), {
      timeout: 25000
    });
  });
});
