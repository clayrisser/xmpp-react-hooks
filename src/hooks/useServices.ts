import Services from '../services';
import useXmpp from './useXmpp';

export default function useServices(): Services | undefined {
  const xmpp = useXmpp();
  return xmpp?.services;
}
