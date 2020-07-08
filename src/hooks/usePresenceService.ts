import { useState, useEffect } from 'react';
import useXmpp from './useXmpp';
import { PresenceService } from '../services';

export default function usePresenceService(): PresenceService | undefined {
  const xmpp = useXmpp();
  const [modPresence, setModPresence] = useState<PresenceService | undefined>();

  useEffect(() => {
    if (!xmpp) return;
    setModPresence(new PresenceService(xmpp));
  }, [xmpp]);

  return modPresence;
}
