import React, { FC } from 'react';
import { Switch, Route, BrowserRouter as Router } from 'react-router-dom';
import ChatList from './ChatList';
import Header from '../containers/Header';
import Home from './Home';
import Info from './Info';

export interface RoutesProps {}

const Routes: FC<RoutesProps> = (_props: RoutesProps) => (
  <Router>
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
        <Info />
      </Route>
    </Switch>
  </Router>
);

Routes.defaultProps = {};

export default Routes;
