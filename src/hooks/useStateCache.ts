import AsyncStorage from '@callstack/async-storage';
import { useState, Dispatch, SetStateAction, useEffect } from 'react';
import useStateCacheConfig from './useStateCacheConfig';

export default function useStateCache<T>(
  key: string,
  initialState: T
): [T | undefined, Dispatch<SetStateAction<T>>] {
  const { enabled, namespace, strict } = useStateCacheConfig();
  const [mutex, setMutex] = useState(enabled);
  const [state, setState] = useState<T | undefined>(undefined);
  key = `${namespace}/${key}`;

  useEffect(() => {
    (async () => {
      if (enabled) {
        try {
          const cachedState = JSON.parse(await AsyncStorage.getItem(key));
          if (typeof cachedState !== 'undefined' && cachedState !== null) {
            setState(cachedState);
          } else {
            setState(initialState);
          }
        } catch (err) {
          setState(initialState);
        }
        setMutex(false);
      }
    })();
  }, []);

  function handleSetState(setStateAction: SetStateAction<T>): void {
    if (mutex) {
      const err = new Error('cannot set state while mutex locked');
      if (strict) {
        throw err;
      } else {
        console.warn(err);
      }
    }
    if (typeof setStateAction === 'function') {
      return setState((prevState: T | undefined) => {
        const state = (setStateAction as (prevState: T | undefined) => T)(
          prevState
        );
        if (enabled) AsyncStorage.setItem(key, JSON.stringify(state));
        return state;
      });
    }
    const state = setStateAction as T;
    if (enabled) AsyncStorage.setItem(key, JSON.stringify(state));
    return setState(state);
  }
  return [state, handleSetState];
}
