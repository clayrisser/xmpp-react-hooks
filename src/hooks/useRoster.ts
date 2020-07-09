import useStateCache from 'use-state-cache';
import { useEffect, useCallback } from 'react';
import useRosterService from './useRosterService';
import useXmpp from './useXmpp';
import { RosterItem } from '../clients';

export default function useRoster(): RosterItem[] | undefined {
  const rosterService = useRosterService();
  const xmpp = useXmpp();
  const [roster, setRoster] = useStateCache<RosterItem[]>(
    [xmpp?.fullJid, 'roster'],
    [],
    (prevRoster: RosterItem[], nextRoster: RosterItem[]) => {
      return nextRoster.reduce(
        (newRoster: RosterItem[], rosterItem: RosterItem) => {
          return updateRoster(newRoster, rosterItem);
        },
        prevRoster
      );
    }
  );

  const updateRoster = useCallback(
    (newRoster: RosterItem[], rosterItem: RosterItem) => {
      newRoster = [...newRoster];
      const newRosterItem = newRoster.find(
        ({ jid }: RosterItem) => jid === rosterItem.jid
      );
      if (newRosterItem) {
        Object.assign(newRosterItem, rosterItem);
      } else {
        newRoster.push(rosterItem);
      }
      return newRoster;
    },
    []
  );

  useEffect(() => {
    let cleanup = () => {};
    (async () => {
      if (!rosterService) return;
      const roster = await rosterService.getRoster();
      setRoster(roster);
      cleanup = rosterService!.readRosterPush((rosterItem: RosterItem) => {
        setRoster(updateRoster(roster, rosterItem));
      });
    })().catch(console.error);
    return () => cleanup();
  }, [rosterService]);

  return roster;
}
