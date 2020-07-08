import useStateCache from 'use-state-cache';
import { useEffect } from 'react';
import useMamService from './useMamService';
import useMessageService from './useMessageService';
import { Message, MamMessage } from '../clients';

export default function useMessage(jid: string): Message[] {
  console.log('jid', jid);
  const messageService = useMessageService();
  const mamService = useMamService();
  const [messages, setMessage] = useStateCache<Message[]>(
    `messages/${jid}`,
    [],
    (state: Message[], delayedState: Message[]) =>
      sortAndFilterMessages([...state, ...delayedState])
  );
  console.log('messages123', messages);

  useEffect(() => {
    console.log('useeffect');
    let cleanup = () => {};
    (async () => {
      const id = Date.now().toString();
      const messagesBatch: Message[] = [];
      if (!messageService || !mamService) return;
      const cleanupReadMamMessages = mamService.readMessages(
        (mamMessage: MamMessage) => {
          messagesBatch.push(mamMessage);
          setMessage(
            sortAndFilterMessages([...(messages || []), ...messagesBatch])
          );
        },
        id
      );
      const cleanupReadSentMessages = messageService.readSentMessages(
        (message: Message) => {
          messagesBatch.push(message);
          setMessage(
            sortAndFilterMessages([...(messages || []), ...messagesBatch])
          );
        }
      );
      const cleanupReadMessages = messageService.readMessages(
        (message: Message) => {
          messagesBatch.push(message);
          setMessage(
            sortAndFilterMessages([...(messages || []), ...messagesBatch])
          );
        }
      );
      mamService.getMessages(jid, id);
      cleanup = () =>
        cleanupReadSentMessages() &&
        cleanupReadMessages() &&
        cleanupReadMamMessages();
    })().catch(console.error);
    return () => cleanup();
  }, [messageService, mamService]);

  return messages || [];
}

function sortAndFilterMessages(messages: Message[]): Message[] {
  return messages
    .filter((message: Message) => {
      let { stamp } = message;
      if (!stamp) return 0;
      if (typeof stamp === 'string') stamp = new Date(stamp);
      return JSON.stringify({
        from: message.from,
        stamp,
        to: message.to
      });
    })
    .sort((message: Message) => {
      let { stamp } = message;
      if (!stamp) return 0;
      if (typeof stamp === 'string') stamp = new Date(stamp);
      return stamp.getTime();
    });
}
