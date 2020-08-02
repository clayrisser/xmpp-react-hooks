import { useState, useEffect } from 'react';
import NewRosterService from '../services/newRoster';
import useXmpp from './useXmpp';

export default function useRosterService(): NewRosterService | undefined {
  const xmpp = useXmpp();
  const [rosterService, setRosterService] = useState<
    NewRosterService | undefined
  >();

  useEffect(() => {
    if (!xmpp?.client) return;
    setRosterService(new NewRosterService(xmpp.client));
  }, [xmpp]);

  return rosterService;
}
