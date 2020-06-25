import { useState, useEffect } from 'react';
import useXmpp from './useXmpp';
import { RegisterService } from '../services';

export default function useRegisterService(): RegisterService | undefined {
  const xmpp = useXmpp();
  const [modRegister, setModRegister] = useState<RegisterService | undefined>();

  useEffect(() => {
    if (!xmpp) return;
    setModRegister(new RegisterService(xmpp));
  }, [xmpp]);

  return modRegister;
}
