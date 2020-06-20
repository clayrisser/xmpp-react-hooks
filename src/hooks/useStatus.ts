import EventEars from 'event-ears';
import { useState, useEffect } from 'react';
import useXmpp from './useXmpp';

export interface Status {
  isOnline: boolean;
  isReady: boolean;
}

export default function useStatus(): Status {
  const xmpp = useXmpp();
  const [status, setStatus] = useState<Status>({
    isOnline: !!xmpp?.isOnline,
    isReady: !!xmpp?.isReady
  });

  useEffect(() => {
    if (!xmpp?.client) return;
    const eventEars = new EventEars(xmpp?.client, {
      offline: () => {
        setStatus({
          isOnline: false,
          isReady: status.isReady
        });
      },
      online: async (_address: any) => {
        setStatus({
          isOnline: true,
          isReady: true
        });
      }
    });
    setStatus({
      isOnline: !!xmpp?.isOnline,
      isReady: !!xmpp?.isReady
    });
    return () => eventEars.cleanup();
  }, [xmpp]);
  return status;
}
