import { describe, expect, it, vi } from 'vitest';
import xml from '@xmpp/xml';
import { PresenceType } from '@xmpp-ts/presence';
import { RosterSubscription } from '@xmpp-ts/roster';
import { Jid } from '../../src/xmppTs.js';
import { FakeXmppClient, createFakeXmpp, rosterPush, rosterResult } from './helpers/fakeClient.js';

describe('RosterService', () => {
  it('emits set for a push carrying no from attribute', () => {
    const { client, services } = createFakeXmpp();
    const onSet = vi.fn();
    services.roster.on('set', onSet);

    // Prosody and ejabberd both omit `from` on pushes to the account's own
    // resource. Upstream dropped these, so the roster never updated.
    const handled = client.deliverIqSet(
      'jabber:iq:roster',
      'query',
      rosterPush({ jid: 'bob@localhost', name: 'Bob' })
    );

    expect(handled).toBe(true);
    expect(onSet).toHaveBeenCalledTimes(1);
    expect(onSet.mock.calls[0]![0].item.jid.bare().toString()).toBe('bob@localhost');
    expect(onSet.mock.calls[0]![0].item.name).toBe('Bob');
  });

  it('emits set for a push from our own bare jid', () => {
    const { client, services } = createFakeXmpp('alice@localhost/test');
    const onSet = vi.fn();
    services.roster.on('set', onSet);

    client.deliverIqSet(
      'jabber:iq:roster',
      'query',
      rosterPush({ jid: 'bob@localhost' }, { from: 'alice@localhost' })
    );

    expect(onSet).toHaveBeenCalledTimes(1);
  });

  it('refuses a push from another account', () => {
    const { client, services } = createFakeXmpp('alice@localhost/test');
    const onSet = vi.fn();
    services.roster.on('set', onSet);

    const handled = client.deliverIqSet(
      'jabber:iq:roster',
      'query',
      rosterPush({ jid: 'evil@elsewhere' }, { from: 'mallory@elsewhere' })
    );

    expect(handled).toBe(false);
    expect(onSet).not.toHaveBeenCalled();
  });

  it('emits remove for a subscription="remove" push', () => {
    const { client, services } = createFakeXmpp();
    const onRemove = vi.fn();
    services.roster.on('remove', onRemove);

    client.deliverIqSet(
      'jabber:iq:roster',
      'query',
      rosterPush({ jid: 'bob@localhost', subscription: 'remove' })
    );

    expect(onRemove).toHaveBeenCalledTimes(1);
    expect(onRemove.mock.calls[0]![0].jid.bare().toString()).toBe('bob@localhost');
  });

  it('ignores a push with no item element', () => {
    const { client, services } = createFakeXmpp();
    const onSet = vi.fn();
    services.roster.on('set', onSet);

    const handled = client.deliverIqSet(
      'jabber:iq:roster',
      'query',
      xml('iq', { type: 'set' }, xml('query', { xmlns: 'jabber:iq:roster', ver: '3' }))
    );

    expect(handled).toBe(false);
    expect(onSet).not.toHaveBeenCalled();
  });

  it('reads the roster over iq', async () => {
    const { client, services } = createFakeXmpp();
    client.respondToIq = () => rosterResult([{ jid: 'bob@localhost', name: 'Bob' }], '7');

    const roster = await services.roster.get();

    expect(roster?.version).toBe('7');
    expect(roster?.items).toHaveLength(1);
    expect(roster?.items[0]!.jid.bare().toString()).toBe('bob@localhost');
  });
});

describe('PresenceService', () => {
  it('parses a presence that omits to, instead of throwing', () => {
    const { services } = createFakeXmpp('alice@localhost/test');

    const presence = services.presence.parsePresence(
      xml('presence', { from: 'bob@localhost/phone' })
    );

    expect(presence.from.toString()).toBe('bob@localhost/phone');
    expect(presence.to.toString()).toBe('alice@localhost/test');
  });

  it('survives the self-presence echo a server sends after available()', () => {
    const { client, services } = createFakeXmpp('alice@localhost/test');
    services.presence.available();

    // No `to`, exactly as prosody echoes it. This used to throw out of the
    // stanza listener and become an uncaught exception.
    expect(() => client.deliver(xml('presence', { from: 'alice@localhost/test' }))).not.toThrow();
  });

  it('emits available for a contact and ignores our own presence', () => {
    const { client, services } = createFakeXmpp('alice@localhost/test');
    const onAvailable = vi.fn();
    services.presence.on('available', onAvailable);

    client.deliver(xml('presence', { from: 'bob@localhost/phone' }));
    client.deliver(xml('presence', { from: 'alice@localhost/other' }));

    expect(onAvailable).toHaveBeenCalledTimes(1);
    expect(onAvailable.mock.calls[0]![0].from.bare().toString()).toBe('bob@localhost');
  });

  it('emits unavailable for a contact going offline', () => {
    const { client, services } = createFakeXmpp('alice@localhost/test');
    const onUnavailable = vi.fn();
    services.presence.on('unavailable', onUnavailable);

    client.deliver(
      xml('presence', {
        from: 'bob@localhost/phone',
        type: PresenceType.UNAVAILABLE
      })
    );

    expect(onUnavailable).toHaveBeenCalledTimes(1);
  });

  it('defaults to accepting subscription requests', () => {
    const { client } = createFakeXmpp('alice@localhost/test');

    client.deliver(
      xml('presence', {
        from: 'bob@localhost',
        type: PresenceType.SUBSCRIBE
      })
    );

    const types = client.sent
      .filter((element) => element.name === 'presence')
      .map((element) => element.attrs.type);
    expect(types).toContain(PresenceType.SUBSCRIBED);
  });

  it('sends unavailable presence on unavailable()', () => {
    const { client, services } = createFakeXmpp();
    services.presence.unavailable();
    expect(client.lastSent('presence')?.attrs.type).toBe(PresenceType.UNAVAILABLE);
  });
});

describe('MessageService', () => {
  it('sends a chat body to the given jid', () => {
    const { client, services } = createFakeXmpp();

    services.message.send({ body: 'hello', to: new Jid('bob@localhost') });

    const sent = client.lastSent('message');
    expect(sent?.attrs.to).toBe('bob@localhost');
    expect(sent?.getChild('body')?.text()).toBe('hello');
  });

  it('emits parsed incoming messages', () => {
    const { client, services } = createFakeXmpp();
    const onMessage = vi.fn();
    services.message.on('message', onMessage);

    client.deliver(
      xml(
        'message',
        {
          from: 'bob@localhost/phone',
          id: 'm1',
          to: 'alice@localhost',
          xmlns: 'jabber:client'
        },
        xml('body', {}, 'hi there')
      )
    );

    expect(onMessage).toHaveBeenCalledTimes(1);
    expect(onMessage.mock.calls[0]![0].body).toBe('hi there');
    expect(onMessage.mock.calls[0]![0].id).toBe('m1');
  });

  it('also reports our own outgoing messages, so both sides land in the store', () => {
    const { services } = createFakeXmpp('alice@localhost/test');
    const onMessage = vi.fn();
    services.message.on('message', onMessage);

    services.message.send({ body: 'hey', to: new Jid('bob@localhost') });

    expect(onMessage).toHaveBeenCalledTimes(1);
    expect(onMessage.mock.calls[0]![0].from.bare().toString()).toBe('alice@localhost');
  });
});

describe('service wiring', () => {
  it('registers a roster iq handler on construction', () => {
    const client = new FakeXmppClient();
    expect(() =>
      client.deliverIqSet('jabber:iq:roster', 'query', rosterPush({ jid: 'bob@localhost' }))
    ).toThrow(/no iq handler/);
  });

  it('exposes every service and honours the debug option', () => {
    const { services } = createFakeXmpp();
    expect(services.message).toBeDefined();
    expect(services.presence).toBeDefined();
    expect(services.roster).toBeDefined();
    expect(services.vCard).toBeDefined();
    expect(services.options.debug).toBe(false);
  });

  it('exposes RosterSubscription for consumers', () => {
    expect(RosterSubscription.REMOVE).toBe('remove');
  });
});
