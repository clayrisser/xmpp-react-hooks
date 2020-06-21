import { useContext } from 'react';
import StateCacheConfigContext, {
  StateCacheConfig
} from '../contexts/stateCacheConfig';

export default function useStateCacheConfig(): StateCacheConfig {
  return useContext<StateCacheConfig>(StateCacheConfigContext);
}
