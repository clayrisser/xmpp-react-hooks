import { Epic, createEpicMiddleware } from 'redux-observable';
import { composeWithDevTools } from 'redux-devtools-extension';
import {
  Persistor,
  Storage,
  persistReducer,
  persistStore
} from 'redux-persist';
import {
  Action,
  Store,
  applyMiddleware,
  createStore as reduxCreateStore
} from 'redux';
import epics from './epics';
import reducers from './reducers';
import { defaultState, State } from './state';

const rootEpic = (epics as unknown) as Epic<Action>;

export function createPersistorStore(
  storage: Storage,
  storageKey?: string
): PersistorStore {
  const rootReducer = persistReducer(
    { key: storageKey || 'xmpp', storage },
    reducers
  );
  const composeEnhancers = composeWithDevTools({});
  const epicMiddleware = createEpicMiddleware();
  const store: Store<State> = reduxCreateStore(
    rootReducer,
    // @ts-ignore
    defaultState,
    composeEnhancers(applyMiddleware(epicMiddleware))
  );
  epicMiddleware.run(rootEpic);
  const persistor = persistStore(store);
  return { store, persistor };
}

export interface PersistorStore {
  store: Store;
  persistor: Persistor;
}
