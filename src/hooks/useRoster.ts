import useStateCache from 'use-state-cache';
import { useEffect } from 'react';
import useXmpp from './useXmpp';
import useRosterService from './useRosterService';
import { RosterItem } from '../clients';

export default function useRoster(): RosterItem[] | undefined {
  const xmpp = useXmpp();
  const [roster, setRoster] = useStateCache<RosterItem[]>(
    `${xmpp?.fullJid}/roster`,
    []
  );
  const rosterService = useRosterService();

  useEffect(() => {
    let cleanup = () => {};
    (async () => {
      if (!rosterService) return;
      const roster = await rosterService.getRoster();
      setRoster(roster);
      cleanup = rosterService!.readRosterPush(
        (rosterItem: RosterItem) => {
          if (roster) setRoster([...roster, rosterItem]);
        },
        { ask: false }
      );
    })().catch(console.error);
    return () => cleanup();
  }, [rosterService]);

  return roster;
}
