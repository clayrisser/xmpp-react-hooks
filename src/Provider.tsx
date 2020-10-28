import React, { FC, useState, ReactNode, useEffect, ReactElement } from 'react';
import { PersistGate } from 'redux-persist/integration/react';
import { Persistor, Storage } from 'redux-persist';
import { Provider as ReduxProvider } from 'react-redux';
import { Store } from 'redux';
import Events from './Events';
import Xmpp from './xmpp';
import XmppContext from './contexts/xmpp';
import { createPersistorStore, createStore } from './store';

let xmppSingleton: Xmpp;

export interface ProviderProps {
  children: ReactNode;
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
  singleton?: boolean;
}

const Provider: FC<ProviderProps> = (props: ProviderProps) => {
  const {
    children,
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

  const [persistor, setPersistor] = useState<Persistor>();
  const [store, setStore] = useState<Store>(createStore());
  const [xmpp, setXmpp] = useState<Xmpp | undefined>();

  useEffect(
    () => () => {
      if (!xmpp) return;
      if (!props.singleton) xmpp.stop();
    },
    [xmpp]
  );

  useEffect(() => {
    if (!username || !(hostname || domain)) return;
    const { persistor, store } = createPersistorStore(
      storage,
      `${storageKey}:${username}@${hostname || domain}`
    );
    setPersistor(persistor);
    setStore(store);
  }, [username, hostname, domain]);

  useEffect(() => {
    (async () => {
      if (username?.length && password?.length) {
        let xmpp = xmppSingleton;
        if (!xmpp || !props.singleton) {
          xmpp = new Xmpp({
            debug,
            domain,
            hostname,
            resource,
            service
          });
          xmppSingleton = xmpp;
          await xmpp.login(username, password);
          await xmpp.start();
        }

        setXmpp(xmpp);
      }
    })();
  }, [username, password]);

  function renderXmppProvider() {
    return (
      <XmppContext.Provider value={xmpp}>
        <Events>{children}</Events>
      </XmppContext.Provider>
    );
  }

  if (!persistor) {
    return <ReduxProvider store={store}>{renderXmppProvider()}</ReduxProvider>;
  }
  return (
    <ReduxProvider store={store}>
      <PersistGate loading={loading} persistor={persistor}>
        {renderXmppProvider()}
      </PersistGate>
    </ReduxProvider>
  );
};

Provider.defaultProps = {
  storageKey: 'xmpp'
};

export default Provider;
