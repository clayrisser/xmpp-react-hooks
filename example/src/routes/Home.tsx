import React, { FC, useState, useContext } from 'react';
import GlobalContext from '../contexts/global';
import { useRosterService } from 'xmpp-react-hooks';

import { useHistory } from 'react-router-dom';

export interface HomeProps {}

const Home: FC<HomeProps> = (_props: HomeProps) => {
  const [, setGlobal] = useContext(GlobalContext);
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  // const roster = useRoster();

  const history = useHistory();

  function handleClick(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    e.preventDefault();
    setGlobal({ username, password });
    history.push('/chat-list');
  }

  return (
    <>
      <h1>Login</h1>
      <form>
        <div style={{ paddingBottom: 10 }}>
          <label htmlFor="username">Username:</label>
          <br />
          <input
            id="username"
            name="username"
            onChange={(e: any) => setUsername(e.target.value)}
            value={username}
          />
        </div>
        <div style={{ paddingBottom: 10 }}>
          <label htmlFor="password">Password:</label>
          <br />
          <input
            id="password"
            name="password"
            onChange={(e: any) => setPassword(e.target.value)}
            type="password"
            value={password}
          />
        </div>
        <button type="submit" onClick={handleClick}>
          login
        </button>
      </form>
    </>
  );
};

Home.defaultProps = {};

export default Home;
