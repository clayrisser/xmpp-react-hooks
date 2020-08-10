import Jid from '@xmpp-ts/jid';
import React, { FC, ReactNode, useEffect } from 'react';
import { Presence } from '@xmpp-ts/presence';
import { RosterItem } from '@xmpp-ts/roster';
import { useDispatch } from 'react-redux';
import { removeRosterItem, setRoster, setRosterItem } from './actions/roster';
import { setAvailable, setUnavailable } from './actions/available';
import { useServices, useStatus } from './hooks';

export interface EventsProps {
  children: ReactNode;
}

const Events: FC<EventsProps> = (props: EventsProps) => {
  const dispatch = useDispatch();
  const services = useServices();
  const status = useStatus();

  useEffect(() => {
    if (!services?.roster || !status.isReady) return () => {};
    function handleRemove({ jid }: { jid: Jid; version?: string }) {
      dispatch(removeRosterItem(jid));
    }
    function handleSet({ item }: { item: RosterItem; version?: string }) {
      dispatch(setRosterItem(item));
    }
    services.roster.on('remove', handleRemove);
    services.roster.on('set', handleSet);
    (async () => {
      const roster = await services.roster.get();
      dispatch(setRoster(roster || null));
    })().catch(console.error);
    return () => {
      services.roster.removeListener('remove', handleRemove);
      services.roster.removeListener('set', handleSet);
    };
  }, [services?.roster, status.isReady]);

  useEffect(() => {
    if (!services?.presence || !status.isReady) return () => {};
    function handleAvailable(presence: Presence) {
      dispatch(setAvailable(presence.from));
    }
    function handleUnavailable(presence: Presence) {
      dispatch(setUnavailable(presence.from));
    }
    services.presence.on('available', handleAvailable);
    services.presence.on('unavailable', handleUnavailable);
    return () => {
      services.presence.removeListener('available', handleAvailable);
      services.presence.removeListener('unavailable', handleUnavailable);
    };
  }, [services?.presence, status.isReady]);

  return <>{props.children}</>;
};

Events.defaultProps = {};

export default Events;
