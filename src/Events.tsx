import Jid from '@xmpp-ts/jid';
import React, { FC, ReactNode, useEffect } from 'react';
import { Message } from '@xmpp-ts/message';
import { Presence } from '@xmpp-ts/presence';
import { RosterItem } from '@xmpp-ts/roster';
import { useDispatch } from 'react-redux';
import { removeRosterItem, setRoster, setRosterItem } from './actions/roster';
import { setAvailable, setUnavailable } from './actions/available';
import { receiveMessage } from './actions/messages';
import {
  useStatus,
  useMessageService,
  useRosterService,
  usePresenceService
} from './hooks';

export interface EventsProps {
  children: ReactNode;
}

const Events: FC<EventsProps> = (props: EventsProps) => {
  const dispatch = useDispatch();
  const messageService = useMessageService();
  const presenceService = usePresenceService();
  const rosterService = useRosterService();
  const status = useStatus();

  useEffect(() => {
    if (!rosterService || !status.isReady) return () => {};
    function handleRemove({ jid }: { jid: Jid; version?: string }) {
      dispatch(removeRosterItem(jid));
    }
    function handleSet({ item }: { item: RosterItem; version?: string }) {
      dispatch(setRosterItem(item));
    }
    rosterService.on('remove', handleRemove);
    rosterService.on('set', handleSet);
    (async () => {
      const roster = await rosterService.get();
      dispatch(setRoster(roster || null));
    })().catch(console.error);
    return () => {
      rosterService.removeListener('remove', handleRemove);
      rosterService.removeListener('set', handleSet);
    };
  }, [rosterService, status.isReady]);

  useEffect(() => {
    if (!presenceService || !status.isReady) return () => {};
    function handleAvailable(presence: Presence) {
      dispatch(setAvailable(presence.from));
    }
    function handleUnavailable(presence: Presence) {
      dispatch(setUnavailable(presence.from));
    }
    presenceService.on('available', handleAvailable);
    presenceService.on('unavailable', handleUnavailable);
    return () => {
      presenceService.removeListener('available', handleAvailable);
      presenceService.removeListener('unavailable', handleUnavailable);
    };
  }, [presenceService, status.isReady]);

  useEffect(() => {
    if (!messageService || !status.isReady) return () => {};
    function handleMessage(message: Message) {
      dispatch(receiveMessage(message));
    }
    messageService.on('message', handleMessage);
    return () => {
      messageService.removeListener('message', handleMessage);
    };
  }, [messageService]);

  return <>{props.children}</>;
};

Events.defaultProps = {};

export default Events;
