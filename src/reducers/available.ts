import Jid from '@xmpp-ts/jid';
import { Action } from '../types';

export enum AvailableActions {
  SetAvailable = 'SET_AVAILABLE',
  SetUnavailable = 'SET_UNAVAILABLE'
}

export default function available(
  state: string[] = [],
  { type, payload }: Action<Jid>
) {
  const jid = payload;
  switch (type) {
    case AvailableActions.SetAvailable: {
      const availableSet = new Set(state);
      availableSet.add(jid.bare().toString());
      return [...availableSet];
    }
    case AvailableActions.SetUnavailable: {
      const availableSet = new Set(state);
      availableSet.delete(jid.bare().toString());
      return [...availableSet];
    }
  }
  return state;
}
