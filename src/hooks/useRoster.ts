import useStateCache from 'use-state-cache';
import { useEffect } from 'react';
import _ from 'lodash';
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
  const updateRoster = async (roster: RosterItem[], rosterItem: RosterItem) => {
    const currentRosterItems: RosterItem[] = _.map(
      roster,
      (rosterSubItem: RosterItem) => {
        return rosterSubItem.jid === rosterItem.jid
          ? rosterItem
          : rosterSubItem;
      }
    );
    const rosterItems = new Set([...currentRosterItems, rosterItem]);
    setRoster([...rosterItems]);
  };

  useEffect(() => {
    let cleanup = () => {};
    (async () => {
      if (!rosterService) return;
      const roster = await rosterService.getRoster();
      setRoster(roster);
      cleanup = rosterService!.readRosterPush((rosterItem: RosterItem) => {
        if (roster) updateRoster(roster, rosterItem);
      });
    })().catch(console.error);
    return () => cleanup();
  }, [rosterService]);

  return roster;
}
