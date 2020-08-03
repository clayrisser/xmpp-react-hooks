import React, { FC, useState, ReactNode, useEffect } from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import Events from './Events';
import Services from './services';
import ServicesContext from './contexts/services';
import Xmpp, { Cleanup } from './xmpp';
import XmppContext from './contexts/xmpp';
import { createStore } from './store';

const store = createStore();

export interface ProviderProps {
  children: ReactNode;
  createCleanup?: (cleanup: Cleanup) => any;
  debug?: boolean;
  domain?: string;
  hostname?: string;
  password?: string;
  resource: string;
  service?: string;
  username?: string;
}

const Provider: FC<ProviderProps> = (props: ProviderProps) => {
  const [services, setServices] = useState<Services | undefined>();
  const [xmpp, setXmpp] = useState<Xmpp | undefined>();
  const {
    children,
    createCleanup,
    debug,
    domain,
    hostname,
    password,
    resource,
    service,
    username
  } = props;

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
        setServices(xmpp.services);
        await xmpp.start();
        if (createCleanup) createCleanup(cleanup);
        setXmpp(xmpp);
      }
    })();
  }, [username, password]);

  return (
    <ReduxProvider store={store}>
      <XmppContext.Provider value={xmpp}>
        <ServicesContext.Provider value={services}>
          <Events>{children}</Events>
        </ServicesContext.Provider>
      </XmppContext.Provider>
    </ReduxProvider>
  );
};

Provider.defaultProps = {};

export default Provider;
