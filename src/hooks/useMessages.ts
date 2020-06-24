import useStateCache from 'use-state-cache';
import { useEffect } from 'react';
import useMessageService from './useMessageService';
import { Message } from '../services';

export default function useMessage(jid: string): Message[] {
  const messageService = useMessageService();
  const [messages, setMessage] = useStateCache<Message[]>(
    `messages/${jid}`,
    []
  );

  useEffect(() => {
    let cleanup = () => {};
    (async () => {
      if (!messageService) return;
      cleanup = messageService.readMessages((message: Message) => {
        if (typeof messages !== 'undefined') {
          setMessage([...messages, message]);
        }
      });
    })().catch(console.error);
    return () => cleanup();
  }, [messageService, messages]);

  return messages || [];
}
