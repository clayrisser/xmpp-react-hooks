import { createContext } from 'react';
import Xmpp from '../xmpp';

export type XmppContextResult = Xmpp | undefined;

export default createContext<XmppContextResult>(undefined);
