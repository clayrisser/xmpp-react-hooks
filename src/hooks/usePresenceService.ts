import type PresenceService from '../services/presence.js';
import useServices from './useServices.js';

/**
 * Broadcast presence and manage subscriptions.
 */
export default function usePresenceService(): PresenceService | undefined {
  return useServices()?.presence;
}
