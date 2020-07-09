import { useEffect, useState } from 'react';
import usePresenceService from './usePresenceService';
import { Presence } from '../services';

export default function useAvailable(): string[] {
  const presenceService = usePresenceService();
  const [available, setAvailable] = useState<string[]>([]);

  useEffect(() => {
    if (!presenceService) return;
    const readAvailableCleanup = presenceService.readAvailable(
      (presence: Presence) => {
        setAvailable([...new Set([...(available || []), presence.from])]);
      }
    );
    const readUnavailableCleanup = presenceService.readUnavailable(
      (presence: Presence) => {
        setAvailable(
          (available || []).filter(
            (available: string) => available !== presence.from
          )
        );
      }
    );
    // TODO: should be improved
    presenceService.sendUnavailable();
    presenceService.sendAvailable();
    return () => readUnavailableCleanup() && readAvailableCleanup();
  }, [presenceService]);

  return available || [];
}
