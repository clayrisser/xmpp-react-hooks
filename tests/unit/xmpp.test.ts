import { describe, expect, it, vi } from 'vitest';
import xml from '@xmpp/xml';
import type { Client as XmppClient } from '@xmpp/client';
import Xmpp from '../../src/xmpp.js';
import { FakeXmppClient, createFakeXmpp } from './helpers/fakeClient.js';

const baseConfig = {
  domain: 'localhost',
  resource: 'test',
  service: 'ws://localhost:5280/xmpp-websocket'
};

function iqResult(id: string, namespace = 'urn:example') {
  return xml('iq', { id, type: 'result' }, xml('query', { xmlns: namespace }));
}

describe('Xmpp construction', () => {
  it('requires a hostname or a domain', () => {
    expect(() => new Xmpp({ resource: 'test' })).toThrow(/hostname or domain is required/);
  });

  it('requires a hostname or a service', () => {
    expect(() => new Xmpp({ domain: 'localhost', resource: 'test' })).toThrow(
      /hostname or service is required/
    );
  });

  it('accepts a hostname on its own', () => {
    expect(() => new Xmpp({ hostname: 'chat.example.com', resource: 'test' })).not.toThrow();
  });

  it('defaults the language to en', () => {
    expect(new Xmpp(baseConfig).lang).toBe('en');
    expect(new Xmpp({ ...baseConfig, lang: 'fr' }).lang).toBe('fr');
  });
});

describe('Xmpp.attach', () => {
  it('builds the services and tracks connection state', () => {
    const client = new FakeXmppClient();
    const xmpp = new Xmpp(baseConfig).attach(client as unknown as XmppClient);

    expect(xmpp.services?.roster).toBeDefined();
    expect(xmpp.isOnline).toBe(false);

    client.emit('online', client.jid);
    expect(xmpp.isOnline).toBe(true);
    expect(xmpp.isReady).toBe(true);

    client.emit('offline');
    expect(xmpp.isOnline).toBe(false);
    // A drop is not the same as never having connected.
    expect(xmpp.isReady).toBe(true);
  });
});

describe('Xmpp error handling', () => {
  it('fans errors out to subscribers instead of rethrowing', () => {
    const client = new FakeXmppClient();
    const xmpp = new Xmpp(baseConfig).attach(client as unknown as XmppClient);
    const seen: Error[] = [];
    xmpp.onError((error) => seen.push(error));

    // Rethrowing here would escape the emitter and kill the app.
    expect(() => client.emit('error', new Error('boom'))).not.toThrow();
    expect(seen.map((error) => error.message)).toEqual(['boom']);
  });

  it('logs when nothing is listening', () => {
    const client = new FakeXmppClient();
    new Xmpp(baseConfig).attach(client as unknown as XmppClient);
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    client.emit('error', new Error('unheard'));

    expect(consoleError).toHaveBeenCalled();
  });

  it('stops notifying after the listener is removed', () => {
    const client = new FakeXmppClient();
    const xmpp = new Xmpp(baseConfig).attach(client as unknown as XmppClient);
    const listener = vi.fn();
    const remove = xmpp.onError(listener);
    remove();
    vi.spyOn(console, 'error').mockImplementation(() => {});

    client.emit('error', new Error('ignored'));

    expect(listener).not.toHaveBeenCalled();
  });
});

describe('Xmpp.handle', () => {
  it('throws before a client exists', () => {
    expect(() => new Xmpp(baseConfig).handle('id', () => {})).toThrow(
      /login to create xmpp client/
    );
  });

  it('matches an iq result by id', () => {
    const { client, xmpp } = createFakeXmpp();
    const seen = vi.fn();
    xmpp.handle('abc', seen);

    client.deliver(iqResult('abc'));
    client.deliver(iqResult('other'));

    expect(seen).toHaveBeenCalledTimes(1);
  });

  it('matches an iq result by namespace and id', () => {
    const { client, xmpp } = createFakeXmpp();
    const seen = vi.fn();
    xmpp.handle(['urn:example', 'abc'], seen);

    client.deliver(iqResult('abc', 'urn:example'));
    client.deliver(iqResult('abc', 'urn:other'));

    expect(seen).toHaveBeenCalledTimes(1);
  });

  it('accepts a predicate and stops on cleanup', () => {
    const { client, xmpp } = createFakeXmpp();
    const seen = vi.fn();
    const cleanup = xmpp.handle((stanza) => stanza.name === 'message', seen);

    client.deliver(xml('message', { id: '1' }));
    cleanup();
    client.deliver(xml('message', { id: '2' }));

    expect(seen).toHaveBeenCalledTimes(1);
  });
});

describe('Xmpp.query', () => {
  it('throws before a client exists', async () => {
    await expect(new Xmpp(baseConfig).query(xml('iq'))).rejects.toThrow(
      /login to create xmpp client/
    );
  });

  it('resolves with the first matching stanza', async () => {
    const { client, xmpp } = createFakeXmpp();
    const pending = xmpp.query(xml('iq', { id: 'q1', type: 'get' }), 'q1');

    client.deliver(iqResult('unrelated'));
    client.deliver(iqResult('q1'));

    expect((await pending).attrs.id).toBe('q1');
    expect(client.lastSent('iq')?.attrs.id).toBe('q1');
  });

  it('drops its listener once resolved', async () => {
    const { client, xmpp } = createFakeXmpp();
    const before = client.listenerCount('stanza');
    const pending = xmpp.query(xml('iq', { id: 'q2', type: 'get' }), 'q2');
    client.deliver(iqResult('q2'));
    await pending;
    expect(client.listenerCount('stanza')).toBe(before);
  });

  it('supports a callback form that keeps listening until cleaned up', async () => {
    const { client, xmpp } = createFakeXmpp();
    const seen = vi.fn();
    const cleanup = await xmpp.query(xml('iq', { id: 'q3', type: 'get' }), 'q3', seen);

    client.deliver(iqResult('q3'));
    client.deliver(iqResult('q3'));
    expect(seen).toHaveBeenCalledTimes(2);

    cleanup();
    client.deliver(iqResult('q3'));
    expect(seen).toHaveBeenCalledTimes(2);
  });

  it('rejects and unsubscribes when the send fails', async () => {
    const { client, xmpp } = createFakeXmpp();
    const before = client.listenerCount('stanza');
    client.send = () => {
      throw new Error('socket closed');
    };

    await expect(xmpp.query(xml('iq', { id: 'q4', type: 'get' }), 'q4')).rejects.toThrow(
      /socket closed/
    );
    expect(client.listenerCount('stanza')).toBe(before);
  });
});

describe('Xmpp.stop', () => {
  it('is a no-op with no client', async () => {
    await expect(new Xmpp(baseConfig).stop()).resolves.toBeUndefined();
  });

  it('announces departure and closes the connection', async () => {
    const { client, xmpp } = createFakeXmpp();
    await xmpp.stop();

    expect(client.lastSent('presence')?.attrs.type).toBe('unavailable');
    expect(client.stopped).toBe(true);
    expect(xmpp.isOnline).toBe(false);
  });

  it('skips the presence when the session never came up', async () => {
    const client = new FakeXmppClient();
    const xmpp = new Xmpp(baseConfig).attach(client as unknown as XmppClient);

    await xmpp.stop();

    // An unauthenticated client has no addresses to put on the stanza, which
    // used to produce an unparseable presence and an uncaught exception.
    expect(client.lastSent('presence')).toBeUndefined();
    expect(client.stopped).toBe(true);
  });
});
