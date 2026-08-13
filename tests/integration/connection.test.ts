import { beforeAll, describe, expect, it } from 'vitest';
import Xmpp from '../../src/xmpp.js';
import { Jid } from '../../src/xmppTs.js';
import { accounts, bareJid, service, waitForServer, xmppDomain } from './helpers/server.js';

/**
 * Exercises the `Xmpp` facade and the stanza services against a live Prosody,
 * with no React in the way. If these pass, the transport, SASL, iq routing and
 * both upstream bug fixes are genuinely working end to end.
 */
describe('Xmpp against a live server', () => {
  beforeAll(async () => {
    await waitForServer();
  });

  async function connect(
    account: { password: string; username: string },
    resource: string
  ): Promise<Xmpp> {
    const xmpp = new Xmpp({ domain: xmppDomain, resource, service });
    await xmpp.login(account.username, account.password);
    await xmpp.start();
    return xmpp;
  }

  it('authenticates and binds a resource', async () => {
    const xmpp = await connect(accounts.alice, 'conn-1');
    try {
      expect(xmpp.isOnline).toBe(true);
      expect(xmpp.isReady).toBe(true);
      expect(xmpp.client?.jid?.bare().toString()).toBe(bareJid('alice'));
      expect(xmpp.client?.jid?.resource).toBe('conn-1');
    } finally {
      await xmpp.stop();
    }
  });

  it('rejects a bad password through the error listener', async () => {
    const xmpp = new Xmpp({ domain: xmppDomain, resource: 'conn-2', service });
    const errors: Error[] = [];
    xmpp.onError((error) => errors.push(error));
    await xmpp.login('alice', 'definitely-not-the-password');

    await expect(xmpp.start()).rejects.toThrow();
    await xmpp.stop().catch(() => {});
  });

  it('round-trips the roster and receives the server push', async () => {
    const xmpp = await connect(accounts.alice, 'conn-3');
    try {
      const roster = xmpp.services!.roster;
      // Becoming an "interested resource" is what makes the server push at
      // all (RFC 6121 §2.1.2).
      await roster.get();
      await roster.remove(new Jid(bareJid('bob'))).catch(() => {});

      const pushed = new Promise<{ item: { jid: Jid; name: string } }>((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error('no roster push arrived')), 10000);
        roster.on('set', (event) => {
          clearTimeout(timer);
          resolve(event as { item: { jid: Jid; name: string } });
        });
      });

      await roster.set({ jid: new Jid(bareJid('bob')), name: 'Bob' });

      // Before the handleSetQuery fix this timed out every time.
      const event = await pushed;
      expect(event.item.jid.bare().toString()).toBe(bareJid('bob'));
      expect(event.item.name).toBe('Bob');

      const fetched = await roster.get();
      expect(fetched?.items.map((item) => item.jid.bare().toString())).toContain(bareJid('bob'));
    } finally {
      await xmpp.stop();
    }
  });

  it('receives a remove push when a contact is deleted', async () => {
    const xmpp = await connect(accounts.alice, 'conn-4');
    try {
      const roster = xmpp.services!.roster;
      await roster.get();
      await roster.set({ jid: new Jid(bareJid('carol')), name: 'Carol' });

      const removed = new Promise<{ jid: Jid }>((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error('no remove push arrived')), 10000);
        roster.on('remove', (event) => {
          clearTimeout(timer);
          resolve(event as { jid: Jid });
        });
      });

      await roster.remove(new Jid(bareJid('carol')));
      expect((await removed).jid.bare().toString()).toBe(bareJid('carol'));
    } finally {
      await xmpp.stop();
    }
  });

  it('does not crash on the self-presence echo', async () => {
    const xmpp = await connect(accounts.alice, 'conn-5');
    try {
      const uncaught: Error[] = [];
      const onUncaught = (error: Error) => uncaught.push(error);
      process.on('uncaughtException', onUncaught);

      // The echo prosody sends back carries no `to`, which used to throw out
      // of the stanza listener and take the process down.
      xmpp.services!.presence.available();
      await new Promise((resolve) => setTimeout(resolve, 1500));

      process.off('uncaughtException', onUncaught);
      expect(uncaught).toEqual([]);
    } finally {
      await xmpp.stop();
    }
  });

  it('delivers a message from one account to another', async () => {
    const alice = await connect(accounts.alice, 'conn-6a');
    const bob = await connect(accounts.bob, 'conn-6b');
    try {
      // A message addressed to a bare JID only reaches a resource that has
      // broadcast presence; otherwise the server stores it offline.
      bob.services!.presence.available();
      await new Promise((resolve) => setTimeout(resolve, 500));

      const received = new Promise<{ body: string; from: Jid }>((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error('no message arrived')), 10000);
        bob.services!.message.on('message', (message) => {
          if (message.body !== 'hello over the wire') return;
          clearTimeout(timer);
          resolve(message as { body: string; from: Jid });
        });
      });

      alice.services!.message.send({
        body: 'hello over the wire',
        to: new Jid(bareJid('bob'))
      });

      const message = await received;
      expect(message.body).toBe('hello over the wire');
      expect(message.from.bare().toString()).toBe(bareJid('alice'));
    } finally {
      await alice.stop();
      await bob.stop();
    }
  });

  it('exchanges presence once a subscription is in place', async () => {
    const alice = await connect(accounts.alice, 'conn-7a');
    const bob = await connect(accounts.bob, 'conn-7b');
    try {
      const alicePresence = alice.services!.presence;
      const bobPresence = bob.services!.presence;
      await alice.services!.roster.get();
      await bob.services!.roster.get();

      const sawBob = new Promise<string>((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error('no available presence for bob')), 15000);
        alicePresence.on('available', (presence) => {
          if (presence.from.bare().toString() !== bareJid('bob')) return;
          clearTimeout(timer);
          resolve(presence.from.bare().toString());
        });
      });

      // Both services default to auto-approving, so this one request settles
      // the subscription in both directions.
      alicePresence.send({
        to: new Jid(bareJid('bob')),
        type: 'subscribe' as never
      });
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // A server only routes a contact's presence to resources that have
      // themselves broadcast presence, so alice has to announce too.
      alicePresence.available();
      bobPresence.available();

      expect(await sawBob).toBe(bareJid('bob'));
    } finally {
      await alice.stop();
      await bob.stop();
    }
  });

  it('reads and writes a vCard', async () => {
    const xmpp = await connect(accounts.carol, 'conn-8');
    try {
      const vCard = xmpp.services!.vCard;
      await vCard.set({ fullName: 'Carol Danvers', nickName: 'carol' });
      const fetched = await vCard.get({ to: bareJid('carol') });
      expect(fetched.fullName).toBe('Carol Danvers');
      expect(fetched.nickName).toBe('carol');
    } finally {
      await xmpp.stop();
    }
  });
});
