import useStateCache from 'use-state-cache';
import { useEffect } from 'react';
import useRosterService from './useRosterService';
import { RosterItem } from '../clients';

export default function useRoster(): RosterItem[] | undefined {
  const [roster, setRoster] = useStateCache<RosterItem[]>('roster', []);
  const rosterService = useRosterService();

  useEffect(() => {
    let cleanup = () => {};
    (async () => {
      if (!rosterService) return;
      const result = await rosterService.getRoster();
      setRoster(result);
      cleanup = rosterService!.readRosterPush((rosterItem: RosterItem) => {
        if (roster) setRoster([...roster, rosterItem]);
      });
    })().catch(console.error);
    return () => cleanup();
  }, [rosterService]);

  return roster;
}
