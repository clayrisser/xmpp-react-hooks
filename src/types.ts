import { Action as ReduxAction } from 'redux';

export interface Action<T = any> extends ReduxAction<string> {
  payload: T;
}
