import { useEffect } from 'react';
import useRosterService from './useRosterService';
import useStateCache from './useStateCache';
import { RosterItem } from '../services';

export default function useRoster(): RosterItem[] {
  const [roster, setRoster] = useStateCache<RosterItem[]>('roster', []);
  const rosterService = useRosterService();

  console.log('roster', roster);

  useEffect(() => {
    let cleanup = () => {};
    (async () => {
      if (!rosterService) return;
      const result = await rosterService.getRoster();
      setRoster(result);
      cleanup = rosterService.readRosterPush((roster: RosterItem[]) =>
        setRoster(roster)
      );
    })().catch(console.error);
    return () => cleanup();
  }, [rosterService]);

  return roster || [];
}
