import React from 'react';
import { Provider as XmppProvider } from 'xmpp-react-hooks';

function App() {
  return (
    <XmppProvider>
      <div>hello, world</div>
    </XmppProvider>
  );
}

export default App;
