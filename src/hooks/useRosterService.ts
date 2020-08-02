import { useState, useEffect } from 'react';
import RosterService from '../services/roster';
import useXmppClient from './useXmppClient';

export default function useRosterService(): RosterService | undefined {
  const xmppClient = useXmppClient();
  const [rosterService, setRosterService] = useState<
    RosterService | undefined
  >();

  useEffect(() => {
    if (!xmppClient) return;
    setRosterService(new RosterService(xmppClient));
  }, [xmppClient]);

  return rosterService;
}
