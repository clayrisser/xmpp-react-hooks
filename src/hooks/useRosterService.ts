import RosterService from '../services/roster';
import useServices from './useServices';

export default function useRosterService(): RosterService | undefined {
  const services = useServices();
  return services?.roster;
}
