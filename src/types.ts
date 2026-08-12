import type { Action as ReduxAction } from 'redux';

// The index signature satisfies redux 5's `UnknownAction`, which `dispatch`
// requires; without it every dispatch call fails to typecheck.
export interface Action<T = any> extends ReduxAction<string> {
  payload: T;
  [extraProps: string]: unknown;
}
