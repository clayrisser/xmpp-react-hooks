import useStateCache from 'use-state-cache';
import { useEffect } from 'react';
import useMessageService from './useMessageService';
import { Message } from '../services';

export default function useMessage(): Message[] {
  const messageService = useMessageService();
  const [message, setMessage] = useStateCache<Message[]>('message', []);

  useEffect(() => {
    let cleanup = () => {};
    (async () => {
      if (!messageService) {
        console.log('hello');
        return;
      }
      cleanup = messageService.readMessages((message: any) => {
        console.log('message123', message);
        setMessage(message);
      });
    })().catch(console.error);
    return () => cleanup();
  }, [messageService]);

  return message || [];
}
