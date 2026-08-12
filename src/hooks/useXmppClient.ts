import type { Client as XmppClient } from '@xmpp/client';
import useXmpp from './useXmpp.js';

/**
 * The underlying xmpp.js client, for stanzas the services do not cover.
 */
export default function useXmppClient(): XmppClient | undefined {
  const xmpp = useXmpp();
  return xmpp?.client;
}
