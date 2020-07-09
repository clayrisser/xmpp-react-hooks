import useStateCache from 'use-state-cache';
import { useEffect } from 'react';
import useRosterService from './useRosterService';
import useXmpp from './useXmpp';
import { RosterItem } from '../clients';

export default function useRoster(): RosterItem[] | undefined {
  const rosterService = useRosterService();
  const xmpp = useXmpp();
  const [roster, setRoster] = useStateCache<RosterItem[]>(
    `${xmpp?.fullJid}/roster`,
    []
  );

  useEffect(() => {
    let cleanup = () => {};
    (async () => {
      if (!rosterService) return;
      const roster = await rosterService.getRoster();
      setRoster(roster);
      cleanup = rosterService!.readRosterPush((newRosterItem: RosterItem) => {
        let newRoster = [...roster];
        const rosterItem = newRoster.find(
          ({ jid }: RosterItem) => jid === newRosterItem.jid
        );
        if (rosterItem) {
          Object.assign(rosterItem, newRosterItem);
        } else {
          newRoster = [...newRoster, newRosterItem];
        }
        setRoster(newRoster);
      });
    })().catch(console.error);
    return () => cleanup();
  }, [rosterService]);

  return roster;
}
