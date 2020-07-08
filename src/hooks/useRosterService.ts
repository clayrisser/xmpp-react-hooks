import { useState, useEffect } from 'react';
import useXmpp from './useXmpp';
import RosterService from '../services/roster';

export default function useRosterService(): RosterService | undefined {
  const xmpp = useXmpp();
  const [rosterService, setRosterService] = useState<
    RosterService | undefined
  >();

  useEffect(() => {
    if (!xmpp) return;
    setRosterService(new RosterService(xmpp));
  }, [xmpp]);

  return rosterService;
}
