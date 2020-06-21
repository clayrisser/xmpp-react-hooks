import XmppContext, { XmppContextResult } from '../contexts/xmpp';
import { useContext } from 'react';

export default function useXmpp(): XmppContextResult {
  return useContext<XmppContextResult>(XmppContext);
}
