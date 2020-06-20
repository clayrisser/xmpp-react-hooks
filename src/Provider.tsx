import React, { FC, useState, ReactNode, useEffect } from 'react';
import Xmpp from './xmpp';
import XmppContext from './contexts/xmpp';

export interface ProviderProps {
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
        setXmpp(xmpp);
      }
    })();
  }, [username, password]);

  return <XmppContext.Provider value={xmpp}>{children}</XmppContext.Provider>;
};

export default Provider;
