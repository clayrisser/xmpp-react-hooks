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
  useVCardService,
  useVCard
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
  const vCard = useVCard();

  useEffect(() => {
    if (!rosterService || !status.isReady) return () => {};
    function handleRemove({ jid }: { jid: Jid; version?: string }) {
      dispatch(removeRosterItem(jid));
    }
    function handleSet({ item }: { item: RosterItem; version?: string }) {
      dispatch(setRosterItem(item));
    }

    const eventNames = rosterService.eventNames();

    if (!eventNames.includes('remove')) {
      rosterService.on('remove', handleRemove);
    }

    if (!eventNames.includes('set')) {
      rosterService.on('set', handleSet);
    }

    (async () => {
      const roster = await rosterService.get();
      if (roster) dispatch(setRoster(roster));
    })().catch(console.error);
    return () => {
      const eventNames = rosterService.eventNames();
      if (eventNames.includes('remove')) {
        rosterService.removeListener('remove', handleRemove);
      }

      if (eventNames.includes('set')) {
        rosterService.removeListener('set', handleSet);
      }
    };
  }, [rosterService, status.isReady]);

  // useEffect(() => {
  //   if (!vCardService || !status.isReady) return () => {};
  //   function handleVCard(vCard: VCard) {
  //     console.log('handlevcard');
  //     dispatch(
  //       setVCard(
  //         new Jid(`${xmppClient?.jid?.local}@xmpp.staging.desklessworkers.com`),
  //         vCard
  //       )
  //     );
  //   }
  //   const { items } = rosterItems;
  //   const roster = items.map(async (item: any) => {
  //     const img = await vCardService?.get({
  //       from: `${xmppClient?.jid?.local}@xmpp.staging.desklessworkers.com`,
  //       to: `${item.jid._local}@${item.jid._domain}`
  //     });
  //     if (img === undefined) return;
  //     if (img.profileImage === undefined) return;
  //     console.log('image', img);
  //     dispatch(
  //       setVCard(
  //         new Jid(`${item.jid._local}@xmpp.staging.desklessworkers.com`),
  //         img
  //       )
  //     );
  //   });

  //   const eventNames = vCardService.eventNames();

  //   if (!eventNames.includes('vcard')) {
  //     vCardService.on('vcard', handleVCard);
  //   }

  //   return () => {
  //     const eventNames = vCardService.eventNames();

  //     if (eventNames.includes('vcard')) {
  //       vCardService.removeListener('vcard', handleVCard);
  //     }
  //   };
  // }, [rosterItems]);

  useEffect(() => {
    if (!rosterItems) return;
    const { items } = rosterItems;

    const card = vCard;
    console.log('card', card);

    console.log('rosterItems', rosterItems);
    let k = 0;
    const roster = items.forEach(async (item: any) => {
      const img = await vCardService?.get({
        from: `${xmppClient?.jid?.local}@xmpp.staging.desklessworkers.com`,
        to: `${item.jid._local}@${item.jid._domain}`
      });

      if (img === undefined) return;
      if (img.profileImage === undefined) return;
      if (k === items.length) {
        console.log('key', k);
      } else {
        console.log('else statement');
        dispatch(
          setVCard(
            new Jid(`${item.jid._local}@xmpp.staging.desklessworkers.com`),
            img
          )
        );
      }
      k++;
      console.log('item', k);
    });
  }, [vCard]);

  useEffect(() => {
    if (!presenceService || !status.isReady) return () => {};
    presenceService.available();
    function handleAvailable(presence: Presence) {
      dispatch(setAvailable(presence.from));
    }
    function handleUnavailable(presence: Presence) {
      dispatch(setUnavailable(presence.from));
    }

    const eventNames = presenceService.eventNames();

    if (!eventNames.includes('available')) {
      presenceService.on('available', handleAvailable);
    }

    if (!eventNames.includes('unavailable')) {
      presenceService.on('unavailable', handleUnavailable);
    }

    return () => {
      presenceService.unavailable();
      const eventNames = presenceService.eventNames();

      if (eventNames.includes('available')) {
        presenceService.removeListener('available', handleAvailable);
      }
      if (eventNames.includes('unavailable')) {
        presenceService.removeListener('unavailable', handleUnavailable);
      }
    };
  }, [presenceService, status.isReady]);

  useEffect(() => {
    return () => {
      presenceService?.unavailable();
    };
  }, []);

  useEffect(() => {
    if (!messageService || !status.isReady) return () => {};
    function handleMessage(message: Message) {
      const jid = xmppClient?.jid.equals(message.from)
        ? message.to
        : message.from;
      dispatch(addMessage(jid, message));
    }
    const eventNames = messageService.eventNames();
    if (!eventNames.includes('message')) {
      messageService.on('message', handleMessage);
    }

    return () => {
      const eventNames = messageService.eventNames();

      if (eventNames.includes('message')) {
        messageService.removeListener('message', handleMessage);
      }
    };
  }, [messageService, status.isReady]);

  return <>{props.children}</>;
};

Events.defaultProps = {};

export default Events;
