# xmpp-react-hooks

> React hooks for XMPP chat, presence, roster and vCards, built on
> [xmpp.js](https://github.com/xmppjs/xmpp.js).

![](assets/xmpp-react-hooks.png)

## Installation

```sh
pnpm add xmpp-react-hooks react
```

`react` is a peer dependency (`^18.2.0 || ^19.0.0`).

### ESM only

From 0.1.0 this package ships **ESM only**, because xmpp.js 0.14 is ESM only.
`require('xmpp-react-hooks')` no longer works. Bundlers (Vite, webpack, Metro,
Next.js) need no configuration. Direct Node usage needs **Node >= 22.12**, one
notch above xmpp.js's own `>= 20.10` floor: `@xmpp-ts` is still CommonJS and
`require()`s xmpp.js internally, which only works on releases where
`require(esm)` is unflagged.

## Quick start

Wrap your app in `Provider` and read state with hooks.

```tsx
import storage from 'redux-persist/lib/storage';
import { Provider, useMessages, useMessageService, useRoster, Jid } from 'xmpp-react-hooks';

function App() {
  return (
    <Provider
      domain="example.com"
      service="wss://example.com/xmpp-websocket"
      username="alice"
      password="hunter2"
      resource="web"
      storage={storage}
      onError={(error) => console.error(error)}
    >
      <Chat />
    </Provider>
  );
}

function Chat() {
  const roster = useRoster();
  const messages = useMessages(new Jid('bob@example.com'));
  const messageService = useMessageService();

  return (
    <>
      <ul>
        {roster.items.map((item) => (
          <li key={item.jid.toString()}>{item.name || item.jid.bare().toString()}</li>
        ))}
      </ul>
      <ol>
        {messages.map((message) => (
          <li key={message.id}>{message.body}</li>
        ))}
      </ol>
      <button onClick={() => messageService?.send({ to: new Jid('bob@example.com'), body: 'hi' })}>
        send
      </button>
    </>
  );
}
```

A runnable version of the above lives in [`example/`](example).

## `Provider`

Opens the connection, owns the redux store, and bridges incoming stanzas into
it. Every hook below requires a `Provider` above it.

| prop         | type                     | default | notes                                                           |
| ------------ | ------------------------ | ------- | --------------------------------------------------------------- |
| `storage`    | `redux-persist` storage  | —       | required                                                        |
| `resource`   | `string`                 | —       | required; the XMPP resource to bind                             |
| `domain`     | `string`                 | —       | XMPP domain; required unless `hostname` is given                |
| `hostname`   | `string`                 | —       | shorthand: implies `domain` and `wss://<hostname>/ws`           |
| `service`    | `string`                 | —       | explicit connection URI; required unless `hostname` is given    |
| `username`   | `string`                 | —       | connection is deferred until username and password are both set |
| `password`   | `string`                 | —       |                                                                 |
| `onError`    | `(error: Error) => void` | —       | login and connection failures; logged to the console if omitted |
| `singleton`  | `boolean`                | `true`  | reuse one connection per `username@domain/resource`             |
| `storageKey` | `string`                 | `xmpp`  | prefix for the persisted store                                  |
| `loading`    | `ReactElement`           | —       | rendered while the persisted store rehydrates                   |
| `debug`      | `boolean`                | `false` | log the stanza stream                                           |

## Hooks

### State

Backed by the redux store, so they re-render when a stanza changes the data.

| hook                | returns                 | description                                               |
| ------------------- | ----------------------- | --------------------------------------------------------- |
| `useRoster()`       | `Roster`                | contact list, kept in sync with server roster pushes      |
| `useMessages(jid?)` | `Message[]`             | conversation with `jid`, oldest first; `[]` when empty    |
| `useAvailable()`    | `Jid[]`                 | contacts currently broadcasting available presence        |
| `useVCard(jid?)`    | `VCard \| undefined`    | cached vCard for one contact; accepts a `Jid` or a string |
| `useVCards()`       | `Record<string, VCard>` | every cached vCard, keyed by bare JID                     |
| `useStatus()`       | `Status`                | `{ isOnline, isReady, error }`                            |

`isReady` latches true once a session has been established, so a transient
drop does not read as "never connected". `error` carries the most recent
client error.

### Services

Imperative handles for sending stanzas. Each is `undefined` until the
connection is up, so call through `?.`.

| hook                   | returns           | description                                          |
| ---------------------- | ----------------- | ---------------------------------------------------- |
| `useMessageService()`  | `MessageService`  | `send({ to, body })`                                 |
| `usePresenceService()` | `PresenceService` | `available()`, `unavailable()`, `send({ to, type })` |
| `useRosterService()`   | `RosterService`   | `get()`, `set({ jid, name })`, `remove(jid)`         |
| `useVCardService()`    | `VCardService`    | `get({ to })`, `set({ fullName, ... })`              |
| `useServices()`        | `Services`        | all four at once                                     |

### Escape hatches

| hook              | returns  | description                                                |
| ----------------- | -------- | ---------------------------------------------------------- |
| `useXmpp()`       | `Xmpp`   | the connection facade — `handle()`, `query()`, `onError()` |
| `useXmppClient()` | `Client` | the raw xmpp.js client, for stanzas nothing else covers    |

`Xmpp.query()` and `Xmpp.handle()` cover custom XEPs without dropping to the
raw client:

```ts
const xmpp = useXmpp();
const reply = await xmpp?.query(xml('iq', { type: 'get', id: 'v1' }), 'v1');
```

## Development

Everything runs through `make`; `pnpm` is the only supported package manager.

```sh
make prepare           # one-time: asdf toolchain + pnpm install
make build             # tsc -> lib/
make test              # unit + integration (starts and stops Prosody)
make test/unit         # unit tests only, no Docker needed
make test/integration  # against a live Prosody in Docker
make lint              # oxlint + oxfmt --check
make format            # oxfmt
```

Both test tiers emit a coverage summary on stdout and `coverage/lcov.info` for
SonarQube.

### Integration tests

`make test/integration` builds and starts the Prosody in
[`docker/`](docker), seeded with `alice`, `bob` and `carol`. It binds
**15222** (c2s) and **15280** (websocket) rather than the XMPP defaults, so a
server another project already has on 5222/5280 keeps working. Override the
ports in `.env` (bootstrapped from `.env.example`).

The suite drives the real hooks against that server: login, roster fetch and
push, message delivery between two sessions, presence subscription, and vCard
read/write.

## License

[MIT License](LICENSE)

[Jam Risser](https://codejam.ninja) © 2020

## Changelog

Review the [changelog](CHANGELOG.md)
