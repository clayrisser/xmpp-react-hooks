import useStateCache from 'use-state-cache';
import { JID } from '@xmpp/jid';
import { useEffect, useState } from 'react';
import { RosterItem, Roster } from '@xmpp-ts/roster';
import useRosterService from './useRosterService';
import useXmpp from './useXmpp';

export default function useRosterGlobal(): Roster | undefined {
  const rosterService = useRosterService();
  const xmpp = useXmpp();
  const [roster, setRoster] = useState<Roster | undefined>();
  // const [roster, setRoster] = useStateCache<Roster>(
  //   [xmpp?.fullJid, 'roster'],
  //   { items: [], version: '' },
  //   reconcileRoster
  // );

  useEffect(() => {
    (async () => {
      if (!rosterService) return;
      const roster = await rosterService.get();
      if (roster) setRoster(roster);
    })().catch(console.error);
  }, [rosterService]);

  useEffect(() => {
    if (!rosterService) return () => {};
    function handlePush({
      item,
      version
    }: {
      item: RosterItem;
      version: string;
    }) {
      setRoster(updateRoster(item, version));
    }
    function handleSet({
      item,
      version
    }: {
      item: RosterItem;
      version: string;
    }) {
      setRoster(updateRoster(item, version));
    }
    function handleRemove({ jid, version }: { jid: JID; version: string }) {
      if (version !== roster?.version) {
        throw new RosterVersionMismatchError(roster?.version, version);
      }
      setRoster(
        (roster?.items || []).reduce(
          (roster: Roster, rosterItem: RosterItem) => {
            if (rosterItem.jid.equals(jid)) return roster;
            roster.items.push(rosterItem);
            return roster;
          },
          { version: roster?.version, items: [] as RosterItem[] } as Roster
        )
      );
    }
    // rosterService.on('push', handlePush)
    rosterService.on('remove', handleRemove);
    rosterService.on('set', handleSet);
    return () => {
      // rosterService.removeListener('push', handlePush)
      rosterService.removeListener('remove', handleRemove);
      rosterService.removeListener('set', handleSet);
    };
  }, [rosterService, roster]);

  function updateRoster(rosterItem: RosterItem, version?: string) {
    if (roster?.version && version && version !== roster.version) {
      throw new RosterVersionMismatchError(roster.version, version);
    }
    const rosterItems = [...(roster?.items || [])];
    const existingRosterItem = rosterItems.find(({ jid }: RosterItem) =>
      rosterItem.jid.equals(jid)
    );
    if (existingRosterItem) Object.assign(existingRosterItem, rosterItem);
    else rosterItems.push(rosterItem);
    return {
      items: rosterItems,
      version: version || ''
    };
  }

  function reconcileRoster(
    prevRoster: Roster | undefined,
    nextRoster: Roster | undefined
  ) {
    const rosterItems: RosterItem[] = [
      ...(prevRoster?.items || []).reduce(
        (newRosterItems: RosterItem[], prevRosterItem: RosterItem) => {
          const newRosterItem = newRosterItems.find(
            (newRosterItem: RosterItem) =>
              newRosterItem.jid.equals(prevRosterItem?.jid)
          );
          const nextRosterItem = (
            nextRoster?.items || []
          ).find((nextRosterItem: RosterItem) =>
            nextRosterItem.jid.equals(prevRosterItem?.jid)
          );
          if (nextRosterItem) {
            Object.assign(newRosterItem, nextRosterItem);
          } else {
            newRosterItems = newRosterItems.filter(
              (newRosterItem: RosterItem) =>
                newRosterItem.jid.equals(prevRosterItem.jid)
            );
          }
          return newRosterItems;
        },
        [...(prevRoster?.items || [])]
      ),
      ...(nextRoster?.items || []).reduce(
        (newRosterItems: RosterItem[], nextRosterItem: RosterItem) => {
          if (
            !(prevRoster?.items || []).find((prevRosterItem: RosterItem) =>
              prevRosterItem.jid.equals(nextRosterItem?.jid)
            )
          ) {
            rosterItems.push(nextRosterItem);
          }
          return newRosterItems;
        },
        []
      )
    ];
    const newRoster: Roster = {
      version: nextRoster?.version || '',
      items: rosterItems
    };
    return newRoster;
  }

  return roster;
}

export class RosterVersionMismatchError extends Error {
  constructor(rosterVersion?: string, rosterItemVersion?: string) {
    super(
      `roster item version '${rosterItemVersion}' cannot be added to the roster version '${rosterVersion}'`
    );
  }
}
