import PresenceService from '../services/presence';
import useServices from './useServices';

export default function usePresenceService(): PresenceService | undefined {
  const services = useServices();
  return services?.presence;
}
