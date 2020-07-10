import React, { FC, useContext, useEffect } from 'react';
import { Switch, Route, useHistory } from 'react-router-dom';
import Chat from './Chat';
import ChatList from './ChatList';
import GlobalContext from '../contexts/global';
import Home from './Home';
import Info from './Info';
import { Footer, Header } from '../containers';

export interface RoutesProps {}

const Routes: FC<RoutesProps> = (_props: RoutesProps) => {
  const [global] = useContext(GlobalContext);
  const history = useHistory();

  useEffect(() => {
    const { username, password } = global;
    if (!username || !password) history.push('/');
  }, []);

  return (
    <>
      <Header />
      <Switch>
        <Route exact path="/">
          <Home />
        </Route>
        <Route path="/chat-list">
          <ChatList />
        </Route>
        <Route path="/info">
          <Info />
        </Route>
        <Route path="/chat/:jid">
          <Chat />
        </Route>
      </Switch>
      <Footer />
    </>
  );
};

Routes.defaultProps = {};

export default Routes;
