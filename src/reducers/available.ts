import type { Jid } from '../xmppTs.js';
import type { Action } from '../types.js';

export enum AvailableActions {
  SetAvailable = 'SET_AVAILABLE',
  SetUnavailable = 'SET_UNAVAILABLE'
}

export default function available(state: string[] = [], { type, payload }: Action<Jid>): string[] {
  switch (type) {
    case AvailableActions.SetAvailable: {
      const availableSet = new Set(state);
      availableSet.add(payload.bare().toString());
      return [...availableSet];
    }
    case AvailableActions.SetUnavailable: {
      const availableSet = new Set(state);
      availableSet.delete(payload.bare().toString());
      return [...availableSet];
    }
    default:
      return state;
  }
}
