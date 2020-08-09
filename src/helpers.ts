import { JID } from '@xmpp/jid';
import { JIDState } from './state';

export function parseJid(jid: string | JIDState, domain?: string): JID {
  if (typeof jid === 'string') {
    return new JID(
      jid.split('@')?.[0],
      jid.split('@')?.[1]?.split('/')?.[0] || domain || 'localhost',
      jid.split('@')?.[1]?.split('/')?.[1]
    );
  }
  return new JID(jid._local, jid._domain, jid._resource);
}
