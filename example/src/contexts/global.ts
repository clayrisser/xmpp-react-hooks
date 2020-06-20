import { createContext } from 'react';

export interface Global {
  username?: string;
  password?: string;
}

export type SetGlobal = (global: Global) => any;

export type GlobalContextType = [Global, SetGlobal];

export default createContext<GlobalContextType>([{}, () => {}]);
