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
      const rosterBatch: RosterItem[] = [];
      const roster = await rosterService.getRoster();
      setRoster(roster);
      cleanup = rosterService!.readRosterPush((rosterItem: RosterItem) => {
        if (roster) {
          rosterBatch.push(rosterItem);
          setRoster([...roster, ...rosterBatch]);
        }
      });
    })().catch(console.error);
    return () => cleanup();
  }, [rosterService]);

  return roster;
}
