import { useState, useEffect } from 'react';
import useXmpp from './useXmpp';
import { MessageClient } from '../clients';

export default function useMessageService(): MessageClient | undefined {
  const xmpp = useXmpp();
  const [messageService, setMessageService] = useState<
    MessageClient | undefined
  >();

  useEffect(() => {
    if (!xmpp) return;
    setMessageService(new MessageClient(xmpp));
  }, [xmpp]);

  return messageService;
}
