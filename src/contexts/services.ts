import { createContext } from 'react';
import Services from '../services';

export type ServicesContextResult = Services | undefined;

export default createContext<ServicesContextResult>(undefined);
