import React, { FC, useContext, useEffect } from 'react';
import { Switch, Route, useHistory } from 'react-router-dom';
import GlobalContext from '../contexts/global';
import Home from './Home';
import Login from './Login';
import Message from './Message';
import Presence from './Presence';
import Roster from './Roster';
import { Footer, Header } from '../containers';
import VCard from './vCard';

export interface RoutesProps {}

const Routes: FC<RoutesProps> = (_props: RoutesProps) => {
  const [global] = useContext(GlobalContext);
  const history = useHistory();

  useEffect(() => {
    const { username, password } = global;
    if (!username || !password) history.push('/login');
  }, [global, history]);

  return (
    <>
      <Header />
      <Switch>
        <Route exact path="/">
          <Home />
        </Route>
        <Route path="/login">
          <Login />
        </Route>
        <Route path="/roster">
          <Roster />
        </Route>
        <Route path="/presence">
          <Presence />
        </Route>
        <Route path="/message">
          <Message />
        </Route>
        <Route path="/vcard">
          <VCard />
        </Route>
      </Switch>
      <Footer />
    </>
  );
};

Routes.defaultProps = {};

export default Routes;
