import { useEffect, useState } from 'react';
import useXmpp from './useXmpp.js';

export interface Status {
  error?: Error;
  isOnline: boolean;
  isReady: boolean;
}

/**
 * Connection status. `isReady` latches once a session has been established,
 * so a transient drop does not look like "never connected". `error` carries
 * the most recent client error, which previously had nowhere to surface and
 * was rethrown into an unhandled exception instead.
 */
export default function useStatus(): Status {
  const xmpp = useXmpp();
  const [status, setStatus] = useState<Status>({
    isOnline: !!xmpp?.isOnline,
    isReady: !!xmpp?.isReady
  });

  useEffect(() => {
    const client = xmpp?.client;
    if (!client) {
      setStatus({ isOnline: false, isReady: false });
      return undefined;
    }
    // Functional updates: the previous implementation closed over `status`
    // and kept writing back the value captured when the effect first ran.
    const handleOffline = () => setStatus((previous) => ({ ...previous, isOnline: false }));
    const handleOnline = () =>
      setStatus((previous) => ({ ...previous, isOnline: true, isReady: true }));
    client.on('offline', handleOffline);
    client.on('online', handleOnline);
    const removeErrorListener = xmpp.onError((error: Error) =>
      setStatus((previous) => ({ ...previous, error }))
    );
    setStatus({ isOnline: !!xmpp.isOnline, isReady: !!xmpp.isReady });
    return () => {
      removeErrorListener();
      client.removeListener('offline', handleOffline);
      client.removeListener('online', handleOnline);
    };
  }, [xmpp]);

  return status;
}
