import { useEffect, useState } from 'react';
import usePresenceService from './usePresenceService';
import { Presence } from '../services';

export default function useAvailable(): string[] {
  const presenceService = usePresenceService();
  const [available, setAvailable] = useState<string[]>([]);

  useEffect(() => {
    if (!presenceService) return;
    const availableBatch = new Set<string>();
    const readAvailableCleanup = presenceService.readAvailable(
      (presence: Presence) => {
        availableBatch.add(presence.from);
        setAvailable([...new Set([...(available || []), ...availableBatch])]);
      }
    );
    const readUnavailableCleanup = presenceService.readUnavailable(
      (presence: Presence) => {
        availableBatch.delete(presence.from);
        setAvailable([
          ...new Set([
            ...(available || []).filter(
              (available: string) => available !== presence.from
            ),
            ...availableBatch
          ])
        ]);
      }
    );
    presenceService.sendUnavailable();
    presenceService.sendAvailable();
    return () => readUnavailableCleanup() && readAvailableCleanup();
  }, [presenceService]);

  return available;
}
