import { Epic, createEpicMiddleware } from 'redux-observable';
import { composeWithDevTools } from 'redux-devtools-extension';
import {
  createStore as reduxCreateStore,
  applyMiddleware,
  Action
} from 'redux';
import { defaultState } from './state';
import reducers from './reducers';
import epics from './epics';

const rootEpic = (epics as unknown) as Epic<Action>;

export function createStore() {
  const composeEnhancers = composeWithDevTools({});
  const epicMiddleware = createEpicMiddleware();
  const rootReducer = reducers;
  const store = reduxCreateStore(
    rootReducer,
    // @ts-ignore
    defaultState,
    composeEnhancers(applyMiddleware(epicMiddleware))
  );
  epicMiddleware.run(rootEpic);
  return store;
}
