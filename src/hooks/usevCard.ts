import vCardService from '../services/vCard';
import useServices from './useServices';

export default function usevCardService(): vCardService | undefined {
  const services = useServices();
  return services?.vCard;
}
