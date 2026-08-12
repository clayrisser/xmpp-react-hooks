import type Services from '../services/index.js';
import useXmpp from './useXmpp.js';

/**
 * All stanza services at once. Prefer the per-service hooks.
 */
export default function useServices(): Services | undefined {
  const xmpp = useXmpp();
  return xmpp?.services;
}
