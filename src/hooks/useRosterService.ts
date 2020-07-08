import { useState, useEffect } from 'react';
import useXmpp from './useXmpp';
import RosterService from '../services/roster';

export default function useRosterService(): RosterService | undefined {
  const xmpp = useXmpp();
  const [modRoster, setModRoster] = useState<RosterService | undefined>();

  useEffect(() => {
    if (!xmpp) return;
    setModRoster(new RosterService(xmpp));
  }, [xmpp]);

  return modRoster;
}
