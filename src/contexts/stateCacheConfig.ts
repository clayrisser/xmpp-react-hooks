import { createContext } from 'react';

export interface StateCacheConfig {
  enabled: boolean;
  namespace: string;
  strict: boolean;
}

export default createContext<StateCacheConfig>({
  enabled: true,
  namespace: '',
  strict: false
});
