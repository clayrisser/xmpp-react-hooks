import { createContext } from 'react';
import { Roster } from '@xmpp-ts/roster';

export type RosterContextType = Roster | undefined;

export default createContext<RosterContextType>(undefined);
