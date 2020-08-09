import React, { FC, useState, ReactNode, useEffect, ReactElement } from 'react';
import useConstructor from 'use-constructor';
import { PersistGate } from 'redux-persist/integration/react';
import { Persistor, Storage } from 'redux-persist';
import { Provider as ReduxProvider } from 'react-redux';
import { Store } from 'redux';
import Events from './Events';
import Xmpp, { Cleanup } from './xmpp';
import XmppContext from './contexts/xmpp';
import { createPersistorStore } from './store';

export interface ProviderProps {
  children: ReactNode;
  createCleanup?: (cleanup: Cleanup) => any;
  debug?: boolean;
  domain?: string;
  hostname?: string;
  loading?: ReactElement;
  password?: string;
  resource: string;
  service?: string;
  storage: Storage;
  storageKey?: string;
  username?: string;
}

const Provider: FC<ProviderProps> = (props: ProviderProps) => {
  const {
    children,
    createCleanup,
    debug,
    domain,
    hostname,
    loading,
    password,
    resource,
    service,
    storage,
    storageKey,
    username
  } = props;

  const [xmpp, setXmpp] = useState<Xmpp | undefined>();
  let [persistor, setPersistor] = useState<Persistor>();
  let [store, setStore] = useState<Store>();

  useConstructor(() => {
    ({ persistor, store } = createPersistorStore(storage, storageKey));
    setPersistor(persistor);
    setStore(store);
  });

  function cleanup() {
    if (!xmpp) return;
  }

  useEffect(() => {
    (async () => {
      if (username?.length && password?.length) {
        const xmpp = new Xmpp({
          debug,
          domain,
          hostname,
          resource,
          service
        });
        await xmpp.login(username, password);
        await xmpp.start();
        if (createCleanup) createCleanup(cleanup);
        setXmpp(xmpp);
      }
    })();
  }, [username, password]);

  return (
    <ReduxProvider store={store!}>
      <PersistGate loading={loading} persistor={persistor!}>
        <XmppContext.Provider value={xmpp}>
          <Events>{children}</Events>
        </XmppContext.Provider>
      </PersistGate>
    </ReduxProvider>
  );
};

Provider.defaultProps = {
  storageKey: 'xmpp'
};

export default Provider;
