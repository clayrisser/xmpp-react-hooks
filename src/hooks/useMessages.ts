import useStateCache from 'use-state-cache';
import { useEffect, useMemo } from 'react';
import useMamService from './useMamService';
import useMessageService from './useMessageService';
import useXmpp from './useXmpp';
import { Message, MamMessage } from '../services';

export default function useMessage(jid: string): Message[] {
  const id = useMemo(() => Date.now().toString(), []);
  const mamService = useMamService();
  const messageService = useMessageService();
  const xmpp = useXmpp();
  const [messages, setMessage] = useStateCache<Message[]>(
    [xmpp?.fullJid, 'messages', jid],
    [],
    (prevMessages: Message[], nextMessages: Message[]) =>
      sortAndFilterMessages([...prevMessages, ...nextMessages])
  );

  useEffect(() => {
    if (!messageService || !mamService) return;
    const cleanupReadMamMessages = mamService.readMessages(
      (mamMessage: MamMessage) => {
        setMessage(sortAndFilterMessages([...(messages || []), mamMessage]));
      },
      { queryId: id }
    );
    const cleanupReadSentMessages = messageService.readSentMessages(
      (message: Message) => {
        setMessage(sortAndFilterMessages([...(messages || []), message]));
      }
    );
    const cleanupReadMessages = messageService.readMessages(
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
  }, [messageService, mamService, jid]);

  return messages || [];
}

export interface MessagesHashMap {
  [key: string]: Message;
}

function sortAndFilterMessages(messages: Message[]): Message[] {
  const messagesHashMap: MessagesHashMap = {};
  messages.forEach((message: Message) => {
    let { stamp, body } = message;
    if (!stamp) return 0;
    if (typeof stamp === 'string') stamp = new Date(stamp);
    const key = JSON.stringify({
      body,
      from: message.from.split('/')[0],
      stamp,
      to: message.to.split('/')[0]
    });
    messagesHashMap[key] = message;
  });
  return Object.values(messagesHashMap)
    .map((message: Message) => message)
    .sort((message: Message) => {
      let { stamp } = message;
      if (!stamp) return 0;
      if (typeof stamp === 'string') stamp = new Date(stamp);
      return stamp.getTime();
    });
}
