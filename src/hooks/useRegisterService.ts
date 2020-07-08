import { useState, useEffect } from 'react';
import useXmpp from './useXmpp';
import { RegisterClient } from '../clients';

export default function useRegisterService(): RegisterClient | undefined {
  const xmpp = useXmpp();
  const [modRegister, setModRegister] = useState<RegisterClient | undefined>();

  useEffect(() => {
    if (!xmpp) return;
    setModRegister(new RegisterClient(xmpp));
  }, [xmpp]);

  return modRegister;
}
