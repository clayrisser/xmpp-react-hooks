import { useState, useEffect } from 'react';
import useXmpp from './useXmpp';
import { PresenceModule } from '../modules';

export default function usePresenceModule(): PresenceModule | undefined {
  const xmpp = useXmpp();
  const [presenceModule, setPresenceModule] = useState<
    PresenceModule | undefined
  >();

  useEffect(() => {
    if (!xmpp) return;
    setPresenceModule(new PresenceModule(xmpp));
  }, [xmpp]);

  return presenceModule;
}
