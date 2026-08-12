import { Jid } from './xmppTs.js';
import XMPPError from '@xmpp/error';
import xmppDebug from '@xmpp/debug';
import Provider from './Provider.js';
import Xmpp from './xmpp.js';

// Named rather than `export *`: `@xmpp-ts/jid` is CommonJS, and re-exporting
// its whole namespace leaks `__esModule` and `module.exports` into our API.
export type { JidObject } from '@xmpp-ts/jid';
export * from '@xmpp/client';

export * from './actions/index.js';
export * from './hooks/index.js';
export * from './reducers/index.js';
export * from './services/index.js';
export * from './state.js';
export * from './store.js';
export * from './xmpp.js';

export type { ProviderProps } from './Provider.js';

export { Provider, Jid, Xmpp, xmppDebug, XMPPError };
