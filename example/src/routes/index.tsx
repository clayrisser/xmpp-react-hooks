import React, { FC, useContext, useEffect } from 'react';
import { Switch, Route, useHistory } from 'react-router-dom';
import GlobalContext from '../contexts/global';
import Home from './Home';
import Message from './Message';
import Presence from './Presence';
import Roster from './Roster';
import { Footer, Header } from '../containers';

export interface RoutesProps {}

const Routes: FC<RoutesProps> = (_props: RoutesProps) => {
  const [global] = useContext(GlobalContext);
  const history = useHistory();

  useEffect(() => {
    const { username, password } = global;
    if (!username || !password) history.push('/');
  }, [global, history]);

  return (
    <>
      <Header />
      <Switch>
        <Route exact path="/">
          <Home />
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
      </Switch>
      <Footer />
    </>
  );
};

Routes.defaultProps = {};

export default Routes;
