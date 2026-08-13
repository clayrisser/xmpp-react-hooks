import { useMemo, useState } from 'react';
import type { FC } from 'react';
import storage from 'redux-persist/lib/storage';
import { BrowserRouter } from 'react-router-dom';
import { Provider as XmppProvider } from 'xmpp-react-hooks';
import GlobalContext, { type Global, type GlobalContextType } from './contexts/global.js';
import Routes from './routes/index.js';

// Defaults line up with the throwaway Prosody in docker/compose.yaml, so
// `make docker/up-d && pnpm --filter example start` is enough to try it.
const domain = import.meta.env.VITE_XMPP_DOMAIN || 'localhost';
const service = import.meta.env.VITE_XMPP_SERVICE || 'ws://localhost:15280/xmpp-websocket';

const App: FC = () => {
  const [global, setGlobal] = useState<Global>({});
  const [error, setError] = useState<Error>();
  const globalValue = useMemo<GlobalContextType>(() => [global, setGlobal], [global]);

  return (
    <GlobalContext.Provider value={globalValue}>
      <XmppProvider
        debug
        domain={domain}
        onError={setError}
        password={global.password}
        resource="example"
        service={service}
        storage={storage}
        username={global.username}
      >
        {error ? <p style={{ color: 'crimson' }}>connection failed: {error.message}</p> : null}
        <BrowserRouter>
          <Routes />
        </BrowserRouter>
      </XmppProvider>
    </GlobalContext.Provider>
  );
};

export default App;
