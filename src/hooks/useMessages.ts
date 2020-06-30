import useStateCache from 'use-state-cache';
import { useEffect } from 'react';
import useMessageService from './useMessageService';
import { Message } from '../services';

export default function useMessage(jid: string): Message[] {
  console.log('jid', jid);
  const messageService = useMessageService();
  const [messages, setMessage] = useStateCache<Message[]>(
    `messages/${jid}`,
    []
  );
  console.log('messages123', messages);

  useEffect(() => {
    console.log('useeffect');
    let cleanup = () => {};
    (async () => {
      console.log('messageService effect', messageService);
      if (!messageService) return;
      cleanup = messageService.readMessages((message: Message) => {
        console.log('hello1234', message);
        if (typeof messages !== 'undefined') {
          setMessage([...messages, message]);
        }
      });
    })().catch(console.error);
    return () => cleanup();
  }, [messageService, messages]);

  return messages || [];
}
