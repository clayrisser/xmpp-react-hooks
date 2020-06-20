import XMPPContext, { XmppContextResult } from '../contexts/xmpp';
import { useContext } from 'react';

export default function useXMPP(): XmppContextResult {
  return useContext<XmppContextResult>(XMPPContext);
}
