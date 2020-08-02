import React, { FC, useState, ReactNode, useEffect } from 'react';
import { Provider as UseStateCacheProvider } from 'use-state-cache';
import Xmpp, { Cleanup } from './xmpp';
import XmppContext from './contexts/xmpp';
import { PresenceService } from './services';

export interface ProviderProps {
  cache?: boolean | string;
  children: ReactNode;
  createCleanup?: (cleanup: Cleanup) => any;
  debug?: boolean;
  domain?: string;
  hostname?: string;
  password?: string;
  resource?: number;
  service?: string;
  username?: string;
}

const Provider: FC<ProviderProps> = (props: ProviderProps) => {
  const [xmpp, setXmpp] = useState<Xmpp | undefined>();
  const {
    cache,
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
    const presenceService = new PresenceService(xmpp);
    presenceService.sendUnavailable();
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
        const presenceService = new PresenceService(xmpp);
        presenceService.enabledHandlePresenceSubscribe();
        await xmpp.start();
        presenceService.sendUnavailable();
        presenceService.sendAvailable();
        if (createCleanup) createCleanup(cleanup);
        setXmpp(xmpp);
      }
    })();
  }, [username, password]);

  return (
    <XmppContext.Provider value={xmpp}>
      <UseStateCacheProvider
        enabled={!!cache}
        namespace={typeof cache === 'string' ? cache : 'xmpp-react-hooks'}
        silence={false}
        strict={false}
      >
        {children}
      </UseStateCacheProvider>
    </XmppContext.Provider>
  );
};

Provider.defaultProps = {
  cache: false
};

export default Provider;
