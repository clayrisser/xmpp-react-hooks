import MessageService from '../services/message';
import useServices from './useServices';

export default function useMessageService(): MessageService | undefined {
  const services = useServices();
  return services?.message;
}
