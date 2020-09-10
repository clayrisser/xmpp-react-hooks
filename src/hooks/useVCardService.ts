import vCardService from '../services/vCard';
import useServices from './useServices';

export default function useVCardService(): vCardService | undefined {
  const services = useServices();
  return services?.vCard;
}
