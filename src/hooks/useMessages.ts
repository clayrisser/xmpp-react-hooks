import useStateCache from 'use-state-cache';
import { useEffect, useMemo } from 'react';
import useMamService from './useMamService';
import useMessageService from './useMessageService';
import useXmpp from './useXmpp';
import { Message, MamMessage } from '../services';

export default function useMessage(jid: string): Message[] {
  const id = useMemo(() => Date.now().toString(), []);
  // console.log('ID', id);
  const mamService = useMamService();
  const messageService = useMessageService();
  const xmpp = useXmpp();
  const [messages, setMessage] = useStateCache<Message[]>(
    [xmpp?.fullJid, 'messages', jid],
    [],
    (prevMessages: Message[], nextMessages: Message[]) =>
      sortAndFilterMessages([...prevMessages, ...nextMessages])
  );
  console.log('hook', messages);

  useEffect(() => {
    if (!messageService || !mamService) return;
    const cleanupReadMamMessages = mamService.readMessages(
      (_mamMessage: MamMessage) => {
        // setMessage(sortAndFilterMessages([...(messages || []), mamMessage]));
      },
      { queryId: id }
    );
    const cleanupReadSentMessages = messageService.enabledHandleReadSentMessages(
      (message: Message) => {
        setMessage(sortAndFilterMessages([...(messages || []), message]));
      }
    );
    const cleanupReadMessages = messageService.enabledHandleReadMessages(
      (message: Message) => {
        setMessage(sortAndFilterMessages([...(messages || []), message]));
      }
    );
    return () =>
      cleanupReadSentMessages() &&
      cleanupReadMessages() &&
      cleanupReadMamMessages();
  }, [messageService, messages]);

  useEffect(() => {
    if (!messageService || !mamService) return;
    mamService.getMessages({ withJid: jid, id });
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
