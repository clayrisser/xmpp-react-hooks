import { createContext } from 'react';
import type Xmpp from '../xmpp.js';

export type XmppContextResult = Xmpp | undefined;

export default createContext<XmppContextResult>(undefined);
