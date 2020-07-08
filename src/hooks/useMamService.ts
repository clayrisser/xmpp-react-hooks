import { useState, useEffect } from 'react';
import useXmpp from './useXmpp';
import { MamClient } from '../clients';

export default function useRosterService(): MamClient | undefined {
  const xmpp = useXmpp();
  const [modMam, setModMam] = useState<MamClient | undefined>();

  useEffect(() => {
    if (!xmpp) return;
    setModMam(new MamClient(xmpp));
  }, [xmpp]);

  return modMam;
}
