# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [0.1.0]

### Breaking

- **ESM only.** xmpp.js 0.14 is ESM only, so this package is too.
  `require('xmpp-react-hooks')` no longer works. Bundlers need no
  configuration; direct Node usage needs Node >= 22.12.
- **React 18 or 19** (`^18.2.0 || ^19.0.0`); React 16 is no longer supported.
- **`useVCard(jid)` returns `VCard | undefined`** rather than an array. Its
  second `roster` argument is gone — use the new `useVCards()` for every
  cached card at once.
- Epics and `redux-observable` removed. All four epic modules were empty
  arrays, so no behaviour changes.

### Fixed

- Roster pushes were dropped, so adding or removing a contact never reached
  the store. A server sends the push with no `from` attribute, which xmpp.js's
  middleware substitutes with the server's domain; the resulting comparison
  against the account's bare JID always failed. The check now reads the raw
  attribute and keeps refusing pushes from any other entity.
- The presence echo a server sends after `available()` omits `to`, which
  upstream treated as a fatal parse error thrown from inside a stanza
  listener — an uncaught exception that took the host app down. Missing `to`
  and `from` are now filled in per RFC 6120 §8.1.1, and an unparseable
  presence is dropped rather than thrown.
- `stop()` no longer announces unavailable presence from a client that never
  authenticated, which produced a stanza with no addresses at all.
- A hardcoded `xmpp.staging.desklessworkers.com` domain filed every contact's
  vCard under one key, so contacts overwrote each other.
- A `useEffect` with no dependency array fired one vCard request per contact
  on every render.
- Client errors were rethrown from the `error` listener, guaranteeing an
  uncaught exception. They now reach subscribers through `Xmpp.onError()` and
  `useStatus().error`.
- A failed login was an unhandled promise rejection that left the tree stuck
  on `loading`. Use the new `onError` prop on `Provider`.
- The connection singleton had one global slot, so a second account was handed
  the first account's connection. It is now keyed per account.
- `useMessages()` returned `undefined` for a conversation with no messages.
- `useRoster()` and `useAvailable()` built new arrays inside their selectors,
  which re-renders on every store notification under react-redux 9.
- `useStatus()` wrote back state captured when its effect first ran.
- The roster reducer mutated the item it was updating in place.

### Changed

- xmpp.js 0.11 → 0.14, React 16 → 18/19, redux 4 → 5, react-redux 7 → 9,
  TypeScript 3.9 → 7.
- Build is plain `tsc`; the Babel toolchain is gone.
- Prettier and ESLint replaced by oxfmt and oxlint; cspell dropped.
- Jest replaced by vitest, with unit and integration tiers. Integration tests
  run against a real Prosody in `docker/`.
- `Makefile` follows the house conventions (`.POSIX`, `make.mk`, `.env`
  support) instead of the `makefiles` npm package.
- The example app moved from an ejected create-react-app to Vite, which also
  removes the vulnerable webpack 4 dependency tree.
- `Xmpp.attach()` lets a caller supply a pre-built xmpp.js client.
- `VCard` is now declared with the fields the client actually parses, rather
  than upstream's `profileImage`-only interface.

### Removed

- Unused dependencies: `@callstack/async-storage`, `core-js`, `date-fns`,
  `ltx`, `use-constructor`, `use-state-cache`, `event-ears`,
  `redux-devtools-extension`, `redux-observable`, `@babel/runtime`.

## [0.0.1] - 2020-06-20

### Added

- Initial release
