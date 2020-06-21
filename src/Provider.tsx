import React, { FC, useState, ReactNode, useEffect } from 'react';
import StateCacheConfigContext from './contexts/stateCacheConfig';
import Xmpp from './xmpp';
import XmppContext from './contexts/xmpp';
import { PresenceService } from './services';

export interface ProviderProps {
  cache?: boolean | string;
  children: ReactNode;
  debug?: boolean;
  domain?: string;
  hostname?: string;
  password?: string;
  resource?: string;
  service?: string;
  username?: string;
}

const Provider: FC<ProviderProps> = (props: ProviderProps) => {
  const [xmpp, setXmpp] = useState<Xmpp | undefined>();
  const {
    cache,
    children,
    debug,
    domain,
    hostname,
    password,
    resource,
    service,
    username
  } = props;

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
        await presenceService.sendPresence();
        setXmpp(xmpp);
      }
    })();
  }, [username, password]);

  return (
    <XmppContext.Provider value={xmpp}>
      <StateCacheConfigContext.Provider
        value={{
          enabled: !!cache,
          namespace: typeof cache === 'string' ? cache : 'xmpp-react-hooks',
          strict: false
        }}
      >
        {children}
      </StateCacheConfigContext.Provider>
    </XmppContext.Provider>
  );
};

Provider.defaultProps = {
  cache: false
};

export default Provider;
