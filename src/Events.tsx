import { Jid } from './xmppTs.js';
import { useEffect } from 'react';
import type { FC, ReactNode } from 'react';
import type { Message } from '@xmpp-ts/message';
import type { Presence } from '@xmpp-ts/presence';
import type { RosterItem } from '@xmpp-ts/roster';
import { useDispatch } from 'react-redux';
import { removeRosterItem, setRoster, setRosterItem } from './actions/roster.js';
import { setAvailable, setUnavailable } from './actions/available.js';
import { addMessage } from './actions/messages.js';
import { setVCard } from './actions/vCard.js';
import {
  useMessageService,
  usePresenceService,
  useRoster,
  useRosterService,
  useStatus,
  useVCardService,
  useXmppClient
} from './hooks/index.js';

export interface EventsProps {
  children: ReactNode;
}

/**
 * Bridges stanza events onto the redux store. Rendered by `Provider`.
 */
const Events: FC<EventsProps> = ({ children }: EventsProps) => {
  const dispatch = useDispatch();
  const messageService = useMessageService();
  const presenceService = usePresenceService();
  const rosterService = useRosterService();
  const status = useStatus();
  const xmppClient = useXmppClient();
  const roster = useRoster();
  const vCardService = useVCardService();

  useEffect(() => {
    if (!rosterService || !status.isReady) return undefined;
    function handleRemove({ jid }: { jid: Jid; version?: string }) {
      dispatch(removeRosterItem(jid));
    }
    function handleSet({ item }: { item: RosterItem; version?: string }) {
      dispatch(setRosterItem(item));
    }
    rosterService.on('remove', handleRemove);
    rosterService.on('set', handleSet);
    // Fetching the roster also marks this resource "interested", which is
    // what makes the server send roster pushes at all (RFC 6121 §2.1.2).
    (async () => {
      const fetched = await rosterService.get();
      if (fetched) dispatch(setRoster(fetched));
    })().catch(console.error);
    return () => {
      rosterService.removeListener('remove', handleRemove);
      rosterService.removeListener('set', handleSet);
    };
  }, [dispatch, rosterService, status.isReady]);

  useEffect(() => {
    if (!presenceService || !status.isReady) return undefined;
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
  }, [dispatch, presenceService, status.isReady]);

  useEffect(() => {
    if (!messageService || !status.isReady) return undefined;
    function handleMessage(message: Message) {
      // Group a conversation under the peer, whichever side sent it.
      const jid = xmppClient?.jid?.equals(message.from) ? message.to : message.from;
      dispatch(addMessage(jid, message));
    }
    messageService.on('message', handleMessage);
    return () => {
      messageService.removeListener('message', handleMessage);
    };
  }, [dispatch, messageService, status.isReady, xmppClient]);

  // No listener for the service's `vcard` event: `@xmpp-ts/vcard`'s
  // `parseVCard` is a stub that returns true without ever emitting, so cards
  // only arrive through the explicit fetch below.
  const rosterJids = roster.items
    .map((item: RosterItem) => item.jid.bare().toString())
    .toSorted()
    .join(',');

  useEffect(() => {
    if (!vCardService || !status.isReady || !rosterJids) return;
    let cancelled = false;
    (async () => {
      for (const jid of rosterJids.split(',')) {
        const vCard = await vCardService.get({ to: jid }).catch(() => undefined);
        // Keyed by the contact the card belongs to. This used to key every
        // card under a hardcoded deployment's domain, so all contacts
        // overwrote one another.
        if (!cancelled && vCard) dispatch(setVCard(new Jid(jid), vCard));
      }
    })().catch(console.error);
    return () => {
      cancelled = true;
    };
    // Depends on the joined string rather than `roster` so it re-runs when
    // the contact set changes and not on every render, which is what the
    // dependency-less version did — one vCard request storm per render.
  }, [dispatch, vCardService, status.isReady, rosterJids]);

  return <>{children}</>;
};

export default Events;
