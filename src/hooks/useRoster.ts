import useStateCache from 'use-state-cache';
import { useEffect, useCallback } from 'react';
import useRosterService from './useRosterService';
import useXmpp from './useXmpp';
import { RosterItem } from '../clients';
import { RosterSubscription } from '../services';

export default function useRoster(): RosterItem[] | undefined {
  const rosterService = useRosterService();
  const xmpp = useXmpp();
  const [roster, setRoster] = useStateCache<RosterItem[]>(
    [xmpp?.fullJid, 'roster'],
    [],
    (prevRoster: RosterItem[], nextRoster: RosterItem[]) => {
      return [
        ...prevRoster.reduce(
          (newRoster: RosterItem[], prevRosterItem: RosterItem) => {
            const newRosterItem = newRoster.find(
              (newRosterItem: RosterItem) =>
                newRosterItem.jid === prevRosterItem.jid
            );
            const nextRosterItem = nextRoster.find(
              (nextRosterItem: RosterItem) =>
                nextRosterItem.jid === prevRosterItem.jid
            );
            if (nextRosterItem) {
              Object.assign(newRosterItem, nextRosterItem);
            } else {
              newRoster = newRoster.filter(
                (newRosterItem: RosterItem) =>
                  newRosterItem.jid !== prevRosterItem.jid
              );
            }
            return newRoster;
          },
          [...prevRoster]
        ),
        ...nextRoster.reduce(
          (newRoster: RosterItem[], nextRosterItem: RosterItem) => {
            if (
              !prevRoster.find(
                (prevRosterItem: RosterItem) =>
                  prevRosterItem.jid === nextRosterItem.jid
              )
            ) {
              newRoster.push(nextRosterItem);
            }
            return newRoster;
          },
          []
        )
      ];
    }
  );

  const updateRoster = useCallback(
    (newRoster: RosterItem[], rosterItem: RosterItem) => {
      newRoster = [...newRoster];
      const newRosterItem = newRoster.find(
        ({ jid }: RosterItem) => jid === rosterItem.jid
      );
      if (rosterItem.subscription === RosterSubscription.REMOVE) {
        newRoster = newRoster.filter(
          (newRosterItem: RosterItem) => newRosterItem.jid !== rosterItem.jid
        );
      } else if (newRosterItem) {
        Object.assign(newRosterItem, rosterItem);
      } else {
        newRoster.push(rosterItem);
      }
      return newRoster;
    },
    [roster]
  );

  useEffect(() => {
    (async () => {
      if (!rosterService) return;
      const newRoster = await rosterService.getRoster();
      setRoster(newRoster);
    })().catch(console.error);
  }, [rosterService]);

  useEffect(() => {
    let cleanup = () => {};
    (async () => {
      if (!rosterService) return;
      cleanup = rosterService!.readRosterPush((rosterItem: RosterItem) => {
        const newRoster = updateRoster(roster || [], rosterItem);
        setRoster(newRoster);
      });
    })().catch(console.error);
    return () => cleanup();
  }, [rosterService, roster]);

  return roster;
}
