import { useContext, useEffect } from 'react';
import type { FC } from 'react';
import { Navigate, Route, Routes as RouterRoutes, useNavigate } from 'react-router-dom';
import GlobalContext from '../contexts/global.js';
import Login from './Login.js';
import Message from './Message.js';
import Presence from './Presence.js';
import Roster from './Roster.js';
import VCard from './vCard.js';
import { Footer, Header } from '../containers/index.js';

const Routes: FC = () => {
  const [global] = useContext(GlobalContext);
  const navigate = useNavigate();

  useEffect(() => {
    const { username, password } = global;
    if (!username || !password) navigate('/login');
  }, [global, navigate]);

  return (
    <>
      <Header />
      <RouterRoutes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/roster" element={<Roster />} />
        <Route path="/presence" element={<Presence />} />
        <Route path="/message" element={<Message />} />
        <Route path="/vcard" element={<VCard />} />
      </RouterRoutes>
      <Footer />
    </>
  );
};

export default Routes;
