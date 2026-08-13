import { useEffect, useMemo, useState } from 'react';
import type { FC, ReactElement, ReactNode } from 'react';
import { PersistGate } from 'redux-persist/lib/integration/react.js';
import { Provider as ReduxProvider } from 'react-redux';
import type { Persistor, Storage } from 'redux-persist';
import type { Store } from 'redux';
import Events from './Events.js';
import Xmpp from './xmpp.js';
import XmppContext from './contexts/xmpp.js';
import { createPersistorStore, createStore } from './store.js';

// Keyed by account so switching users cannot hand the new session the
// previous user's connection, which the old single-slot singleton did.
const singletons = new Map<string, Xmpp>();

export interface ProviderProps {
  children: ReactNode;
  debug?: boolean;
  domain?: string;
  hostname?: string;
  loading?: ReactElement;
  onError?: (error: Error) => void;
  password?: string;
  resource: string;
  service?: string;
  singleton?: boolean;
  storage: Storage;
  storageKey?: string;
  username?: string;
}

const Provider: FC<ProviderProps> = ({
  children,
  debug,
  domain,
  hostname,
  loading,
  onError,
  password,
  resource,
  service,
  singleton = true,
  storage,
  storageKey = 'xmpp',
  username
}: ProviderProps) => {
  const [persistor, setPersistor] = useState<Persistor>();
  const [store, setStore] = useState<Store>(createStore);
  const [xmpp, setXmpp] = useState<Xmpp | undefined>();

  const account = useMemo(
    () =>
      username && (hostname || domain)
        ? `${username}@${hostname || domain}/${resource}`
        : undefined,
    [username, hostname, domain, resource]
  );

  useEffect(() => {
    if (!account) return;
    const persistorStore = createPersistorStore(storage, `${storageKey}:${account}`);
    setPersistor(persistorStore.persistor);
    setStore(persistorStore.store);
  }, [account, storage, storageKey]);

  useEffect(() => {
    if (!account || !username?.length || !password?.length) return undefined;
    let cancelled = false;
    const existing = singleton ? singletons.get(account) : undefined;
    if (existing) {
      setXmpp(existing);
      return undefined;
    }
    let instance: Xmpp | undefined;
    // Construction validates the config and can throw. Doing it inside the
    // async body routes a misconfiguration to `onError` rather than letting
    // it escape the effect and unmount the tree.
    (async () => {
      instance = new Xmpp({ debug, domain, hostname, resource, service });
      if (singleton) singletons.set(account, instance);
      await instance.login(username, password);
      await instance.start();
      if (!cancelled) setXmpp(instance);
    })().catch((error: Error) => {
      // Previously an unhandled rejection: a wrong password silently left the
      // tree stuck on `loading` with nothing logged.
      singletons.delete(account);
      if (onError) onError(error);
      else console.error('xmpp login failed', error);
    });
    return () => {
      cancelled = true;
      if (!singleton) instance?.stop().catch(() => {});
    };
    // `onError` is intentionally excluded — a caller passing an inline
    // callback would otherwise tear the connection down on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account, username, password, debug, domain, hostname, resource, service, singleton]);

  const tree = (
    <XmppContext.Provider value={xmpp}>
      <Events>{children}</Events>
    </XmppContext.Provider>
  );

  if (!persistor) return <ReduxProvider store={store}>{tree}</ReduxProvider>;
  return (
    <ReduxProvider store={store}>
      <PersistGate loading={loading} persistor={persistor}>
        {tree}
      </PersistGate>
    </ReduxProvider>
  );
};

export default Provider;
