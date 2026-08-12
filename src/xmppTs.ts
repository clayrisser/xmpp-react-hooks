import JidModule from '@xmpp-ts/jid';
import MessageClientModule from '@xmpp-ts/message';
import PresenceClientModule from '@xmpp-ts/presence';
import RosterClientModule from '@xmpp-ts/roster';
import VCardClientModule from '@xmpp-ts/vcard';

/**
 * The `@xmpp-ts` packages are Babel-built CommonJS. A bundler reads their
 * `__esModule` marker and hands back the class directly, but Node's ESM
 * loader ignores that marker and hands back `module.exports`, leaving the
 * class one level down under `.default`. Unwrapping here keeps every other
 * module free of the distinction.
 *
 * Drop this once `@xmpp-ts` ships an ESM build.
 */
function interopDefault<T>(value: T): T {
  return (value as { default?: T })?.default ?? value;
}

export const Jid = interopDefault(JidModule);
export const MessageClient = interopDefault(MessageClientModule);
export const PresenceClient = interopDefault(PresenceClientModule);
export const RosterClient = interopDefault(RosterClientModule);
export const VCardClient = interopDefault(VCardClientModule);

// Same name in both the value and type space, so `import { Jid }` covers
// `new Jid(...)` and `jid: Jid` alike.
export type Jid = InstanceType<typeof Jid>;
