import useStateCache from 'use-state-cache';
import { useEffect } from 'react';
import useRosterService from './useRosterService';
import { RosterItem } from '../services';

export default function useRoster(): RosterItem[] | undefined {
  const [roster, setRoster] = useStateCache<RosterItem[]>('roster', []);
  console.log('roster123', roster);
  const rosterService = useRosterService();

  useEffect(() => {
    let cleanup = () => {};
    (async () => {
      if (!rosterService) return;
      const result = await rosterService.getRoster();
      setRoster(result);
      cleanup = rosterService!.readRosterPush((roster: RosterItem[]) =>
        setRoster(roster)
      );
    })().catch(console.error);
    return () => cleanup();
  }, [rosterService]);

  return roster;
}
