import { useState, useEffect } from 'react';
import useXmpp from './useXmpp';
import { MessageService } from '../services';

export default function useMessageService(): MessageService | undefined {
  const xmpp = useXmpp();
  const [modMessage, setModMessage] = useState<MessageService | undefined>();

  useEffect(() => {
    if (!xmpp) return;
    setModMessage(new MessageService(xmpp));
  }, [xmpp]);

  return modMessage;
}
