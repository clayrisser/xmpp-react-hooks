import React, { FC, useState, useContext } from 'react';
import GlobalContext from '../contexts/global';
import { useHistory } from 'react-router-dom';

export interface LoginProps {}

const Login: FC<LoginProps> = (_props: LoginProps) => {
  const [, setGlobal] = useContext(GlobalContext);
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');

  const history = useHistory();

  function handleClick(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    e.preventDefault();
    setGlobal({ username, password });
    history.push('/roster');
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
        <br />
        <button type="submit" onClick={handleClick}>
          login
        </button>
      </form>
    </>
  );
};

Login.defaultProps = {};

export default Login;
