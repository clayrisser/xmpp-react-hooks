import { useState, useEffect } from 'react';
import useXmpp from './useXmpp';
import { MessageService } from '../services';

export default function useMessageService(): MessageService | undefined {
  const xmpp = useXmpp();
  const [messageService, setMessageService] = useState<
    MessageService | undefined
  >();

  useEffect(() => {
    if (!xmpp) return;
    setMessageService(new MessageService(xmpp));
  }, [xmpp]);

  return messageService;
}
