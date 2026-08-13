import type RosterService from '../services/roster.js';
import useServices from './useServices.js';

/**
 * Read and mutate the contact list.
 */
export default function useRosterService(): RosterService | undefined {
  return useServices()?.roster;
}
