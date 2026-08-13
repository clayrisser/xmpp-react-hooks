import { useContext, useState } from 'react';
import type { FC, MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import GlobalContext from '../contexts/global.js';

const Login: FC = () => {
  const [, setGlobal] = useContext(GlobalContext);
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const navigate = useNavigate();

  function handleClick(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    setGlobal({ username, password });
    navigate('/roster');
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
            onChange={(e) => setUsername(e.target.value)}
            value={username}
          />
        </div>
        <div style={{ paddingBottom: 10 }}>
          <label htmlFor="password">Password:</label>
          <br />
          <input
            id="password"
            name="password"
            onChange={(e) => setPassword(e.target.value)}
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

export default Login;
