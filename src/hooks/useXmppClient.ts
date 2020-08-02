import { XmppClient } from '@xmpp/client';
import useXmpp from './useXmpp';

export default function useXmppClient(): XmppClient | undefined {
  const xmpp = useXmpp();
  return xmpp?.client;
}
