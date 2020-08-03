import React, { FC, ReactNode, useEffect } from 'react';
import { RosterItem } from '@xmpp-ts/roster';
import { useDispatch } from 'react-redux';
import { JID } from '@xmpp/jid';
import { addRosterItem, removeRosterItem } from './actions/roster';
import { useServices } from './hooks';

export interface EventsProps {
  children: ReactNode;
}

const Events: FC<EventsProps> = (props: EventsProps) => {
  const dispatch = useDispatch();
  const services = useServices();

  useEffect(() => {
    if (!services) return () => {};
    function handleRemove({ jid }: { jid: JID; version?: string }) {
      dispatch(removeRosterItem(jid));
    }
    function handleSet({ item }: { item: RosterItem; version?: string }) {
      dispatch(addRosterItem(item));
    }
    services.roster.on('remove', handleRemove);
    services.roster.on('set', handleSet);
    return () => {
      services.roster.removeListener('remove', handleRemove);
      services.roster.removeListener('set', handleSet);
    };
  }, [services]);

  return <>{props.children}</>;
};

Events.defaultProps = {};

export default Events;
