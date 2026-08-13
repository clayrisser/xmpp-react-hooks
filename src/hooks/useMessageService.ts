import type MessageService from '../services/message.js';
import useServices from './useServices.js';

/**
 * Send messages and subscribe to incoming ones.
 */
export default function useMessageService(): MessageService | undefined {
  return useServices()?.message;
}
