import React, { FC, useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Provider as XmppProvider } from 'xmpp-react-hooks';
import GlobalContext, { Global } from './contexts/global';
import Routes from './routes';

export interface AppProps {}

const App: FC<AppProps> = (_props: AppProps) => {
  const [global, setGlobal] = useState<Global>({});

  return (
    <GlobalContext.Provider value={[global, setGlobal]}>
      <XmppProvider
        cache
        debug
        hostname="test.siliconhills.dev"
        password={global.password}
        username={global.username}
      >
        <Router>
          <Routes />
        </Router>
      </XmppProvider>
    </GlobalContext.Provider>
  );
};

App.defaultProps = {};

export default App;
