import useStateCache from 'use-state-cache';
import { useEffect } from 'react';
import useMamService from './useMamService';
import useMessageService from './useMessageService';
import useXmpp from './useXmpp';
import { Message, MamMessage } from '../clients';

export default function useMessage(jid: string): Message[] {
  const mamService = useMamService();
  const messageService = useMessageService();
  const xmpp = useXmpp();
  const [messages, setMessage] = useStateCache<Message[]>(
    [xmpp?.fullJid, 'messages', jid],
    [],
    (state: Message[], delayedState: Message[]) =>
      sortAndFilterMessages([...state, ...delayedState])
  );

  useEffect(() => {
    const id: string = Date.now().toString();
    const messagesBatch: Message[] = [];
    if (!messageService || !mamService) return;
    const cleanupReadMamMessages = mamService.readMessages(
      (_mamMessage: MamMessage) => {
        // messagesBatch.push(mamMessage);
        // setMessage(
        //   sortAndFilterMessages([...(messages || []), ...messagesBatch])
        // );
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
    mamService.getMessages({ With: jid, id });
    return () =>
      cleanupReadSentMessages() &&
      cleanupReadMessages() &&
      cleanupReadMamMessages();
  }, [messageService, mamService]);

  return messages || [];
}

function sortAndFilterMessages(messages: Message[]): Message[] {
  return messages;
  // return messages
  //   .filter((message: Message) => {
  //     let { stamp } = message;
  //     if (!stamp) return 0;
  //     if (typeof stamp === 'string') stamp = new Date(stamp);
  //     return JSON.stringify({
  //       from: message.from,
  //       stamp,
  //       to: message.to
  //     });
  //   })
  //   .sort((message: Message) => {
  //     let { stamp } = message;
  //     if (!stamp) return 0;
  //     if (typeof stamp === 'string') stamp = new Date(stamp);
  //     return stamp.getTime();
  //   });
}
