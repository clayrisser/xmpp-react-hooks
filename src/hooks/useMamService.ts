import { useState, useEffect } from 'react';
import useXmpp from './useXmpp';
import { MamService } from '../services';

export default function useRosterService(): MamService | undefined {
  const xmpp = useXmpp();
  const [modMam, setModMam] = useState<MamService | undefined>();

  useEffect(() => {
    if (!xmpp) return;
    setModMam(new MamService(xmpp));
  }, [xmpp]);

  return modMam;
}
