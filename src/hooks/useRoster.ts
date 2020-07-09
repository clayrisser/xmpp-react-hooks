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
      let roster = await rosterService.getRoster();
      setRoster(roster);
      cleanup = rosterService!.readRosterPush((rosterItem: RosterItem) => {
        if (roster) {
          roster = [...roster, rosterItem];
          setRoster(
            roster.filter(
              (rosterItem: RosterItem) =>
                roster.filter(
                  (rosterSubItem: RosterItem) =>
                    rosterItem.jid === rosterSubItem.jid
                ).length > 1
            )
          );
        }
      });
    })().catch(console.error);
    return () => cleanup();
  }, [rosterService]);

  return roster;
}
