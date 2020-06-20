import React, { FC, useState } from 'react';
import { Provider as XmppProvider } from 'xmpp-react-hooks';
import GlobalContext, { Global } from './contexts/global';
import Routes from './routes';

export interface AppProps {}

const App: FC<AppProps> = (_props: AppProps) => {
  const [global, setGlobal] = useState<Global>({});

  return (
    <GlobalContext.Provider value={[global, setGlobal]}>
      <XmppProvider
        hostname="test.siliconhills.dev"
        password={global.password}
        username={global.username}
      >
        <Routes />
      </XmppProvider>
    </GlobalContext.Provider>
  );
};

App.defaultProps = {};

export default App;
