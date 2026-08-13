import type { ReactNode } from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import type { Store } from 'redux';
import XmppContext from '../../../src/contexts/xmpp.js';
import { createStore } from '../../../src/store.js';
import type Xmpp from '../../../src/xmpp.js';

export interface HarnessOptions {
  store?: Store;
  xmpp?: Xmpp;
}

/**
 * Wraps a hook under test in the same two providers `Provider` sets up, minus
 * the persistence layer.
 */
export function createWrapper({ store, xmpp }: HarnessOptions = {}) {
  const activeStore = store ?? createStore();
  const wrapper = ({ children }: { children: ReactNode }) => (
    <ReduxProvider store={activeStore}>
      <XmppContext.Provider value={xmpp}>{children}</XmppContext.Provider>
    </ReduxProvider>
  );
  return { store: activeStore, wrapper };
}
