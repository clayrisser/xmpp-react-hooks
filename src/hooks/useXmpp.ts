import { useContext } from 'react';
import XmppContext, { XmppContextResult } from '../contexts/xmpp';

export default function useXmpp(): XmppContextResult {
  return useContext<XmppContextResult>(XmppContext);
}
