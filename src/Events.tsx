import Jid from '@xmpp-ts/jid';
import React, { FC, ReactNode, useEffect } from 'react';
import { Message } from '@xmpp-ts/message';
import { Presence } from '@xmpp-ts/presence';
import { RosterItem } from '@xmpp-ts/roster';
import { useDispatch } from 'react-redux';
import { VCard } from '@xmpp-ts/vcard';
import { removeRosterItem, setRoster, setRosterItem } from './actions/roster';
import { setAvailable, setUnavailable } from './actions/available';
import { addMessage } from './actions/messages';
import {
  useMessageService,
  usePresenceService,
  useRosterService,
  useStatus,
  useXmppClient,
  useRoster,
  useVCardService
} from './hooks';
import { setVCard } from './actions/vCard';

export interface EventsProps {
  children: ReactNode;
}

const Events: FC<EventsProps> = (props: EventsProps) => {
  const dispatch = useDispatch();
  const messageService = useMessageService();
  const presenceService = usePresenceService();
  const rosterService = useRosterService();
  const status = useStatus();
  const xmppClient = useXmppClient();
  const rosterItems = useRoster();
  const vCardService = useVCardService();

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
      if (roster) dispatch(setRoster(roster));
    })().catch(console.error);
    return () => {
      rosterService.removeListener('remove', handleRemove);
      rosterService.removeListener('set', handleSet);
    };
  }, [rosterService, status.isReady]);

  useEffect(() => {
    if (!vCardService || !status.isReady) return () => {};
    function handleVCard(vCard: VCard) {
      dispatch(
        setVCard(
          new Jid(`${xmppClient?.jid?.local}@xmpp.staging.desklessworkers.com`),
          vCard
        )
      );
    }
    const { items } = rosterItems;
    const roster = items.map(async (item: any) => {
      const img = await vCardService?.get({
        from: `${xmppClient?.jid?.local}@xmpp.staging.desklessworkers.com`,
        to: `${item.jid._local}@${item.jid._domain}`
      });
      if (img === undefined) return;
      if (img.profileImage === undefined) return;

      dispatch(
        setVCard(
          new Jid(`${item.jid._local}@xmpp.staging.desklessworkers.com`),
          img
        )
      );
    });

    vCardService.on('vcard', handleVCard);
    return () => {
      vCardService.removeListener('vcard', handleVCard);
    };
  }, [vCardService, status.isReady]);

  useEffect(() => {
    if (!presenceService || !status.isReady) return () => {};
    presenceService.available();
    function handleAvailable(presence: Presence) {
      dispatch(setAvailable(presence.from));
    }
    function handleUnavailable(presence: Presence) {
      dispatch(setUnavailable(presence.from));
    }
    presenceService.on('available', handleAvailable);
    presenceService.on('unavailable', handleUnavailable);
    return () => {
      presenceService.unavailable();
      presenceService.removeListener('available', handleAvailable);
      presenceService.removeListener('unavailable', handleUnavailable);
    };
  }, [presenceService, status.isReady]);

  useEffect(() => {
    if (!messageService || !status.isReady) return () => {};
    function handleMessage(message: Message) {
      const jid = xmppClient?.jid.equals(message.from)
        ? message.to
        : message.from;
      dispatch(addMessage(jid, message));
    }
    messageService.on('message', handleMessage);
    return () => {
      messageService.removeListener('message', handleMessage);
    };
  }, [messageService, status.isReady]);

  return <>{props.children}</>;
};

Events.defaultProps = {};

export default Events;
