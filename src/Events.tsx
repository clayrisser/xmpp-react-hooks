import React, { FC, ReactNode, useEffect } from 'react';
import { RosterItem } from '@xmpp-ts/roster';
import { useDispatch } from 'react-redux';
import { JID } from '@xmpp/jid';
import { removeRosterItem, setRoster, setRosterItem } from './actions/roster';
import { useServices, useStatus } from './hooks';

export interface EventsProps {
  children: ReactNode;
}

const Events: FC<EventsProps> = (props: EventsProps) => {
  const dispatch = useDispatch();
  const services = useServices();
  const status = useStatus();

  useEffect(() => {
    if (!services || !status.isReady) return () => {};
    function handleRemove({ jid }: { jid: JID; version?: string }) {
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
  }, [services, status.isReady]);

  return <>{props.children}</>;
};

Events.defaultProps = {};

export default Events;
