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

export function createStore(): Store<State> {
  return reduxCreateStore(
    reducers,
    // @ts-ignore
    defaultState
  );
}

export function createPersistorStore(
  storage: Storage,
  storageKey?: string
): PersistorStore {
  const composeEnhancers = composeWithDevTools({});
  const epicMiddleware = createEpicMiddleware();
  const rootReducer = persistReducer(
    { key: storageKey || 'xmpp', storage, blacklist: ['available'] },
    reducers
  );
  const store: Store<State> = reduxCreateStore(
    rootReducer,
    // @ts-ignore
    defaultState,
    composeEnhancers(applyMiddleware(epicMiddleware))
  );
  const persistor = persistStore(store);
  epicMiddleware.run(rootEpic);
  return { store, persistor };
}

export interface PersistorStore {
  store: Store;
  persistor: Persistor;
}
