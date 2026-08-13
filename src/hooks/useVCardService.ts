import type VCardService from '../services/vCard.js';
import useServices from './useServices.js';

/**
 * Fetch and publish vCards.
 */
export default function useVCardService(): VCardService | undefined {
  return useServices()?.vCard;
}
