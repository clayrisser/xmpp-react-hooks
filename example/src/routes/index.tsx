import React, { FC } from 'react';
import { Switch, Route, BrowserRouter as Router } from 'react-router-dom';
import ChatList from './ChatList';
import Home from './Home';

export interface RoutesProps {}

const Routes: FC<RoutesProps> = (_props: RoutesProps) => (
  <Router>
    <Switch>
      <Route path="/chat-list">
        <ChatList />
      </Route>
      <Route path="/">
        <Home />
      </Route>
    </Switch>
  </Router>
);

Routes.defaultProps = {};

export default Routes;
