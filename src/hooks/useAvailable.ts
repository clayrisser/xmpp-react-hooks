import { useState, useEffect } from 'react';
import usePresenceService from './usePresenceService';
import { Presence, PresenceType } from '../services';

export default function useAvailable(): string[] {
  const presenceService = usePresenceService();
  const [available, setAvailable] = useState<string[]>([]);

  useEffect(() => {
    if (!presenceService) return;
    const readAvailableCleanup = presenceService.readPresence(
      (presence: Presence) => {
        setAvailable([...new Set([...available, presence.from])]);
      },
      { type: null }
    );
    const readUnavailableCleanup = presenceService.readPresence(
      (presence: Presence) => {
        setAvailable(
          available.filter((available: string) => available !== presence.from)
        );
      },
      { type: PresenceType.UNAVAILABLE }
    );
    return () => readUnavailableCleanup() && readAvailableCleanup();
  }, [presenceService]);

  return available;
}
