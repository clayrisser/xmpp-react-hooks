import { useContext } from 'react';
import XmppContext, { type XmppContextResult } from '../contexts/xmpp.js';

/**
 * The `Xmpp` instance owned by the nearest `Provider`, or undefined before
 * login completes.
 */
export default function useXmpp(): XmppContextResult {
  return useContext<XmppContextResult>(XmppContext);
}
