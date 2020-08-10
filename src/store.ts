import { Epic, createEpicMiddleware, EpicMiddleware } from 'redux-observable';
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

export function createStoreEpicMiddleware(
  rootReducer: any
): [Store, EpicMiddleware<any>] {
  const composeEnhancers = composeWithDevTools({});
  const epicMiddleware = createEpicMiddleware();
  const store: Store<State> = reduxCreateStore(
    rootReducer,
    // @ts-ignore
    defaultState,
    composeEnhancers(applyMiddleware(epicMiddleware))
  );
  return [store, epicMiddleware];
}

export function createStore() {
  const rootReducer = reducers;
  const [store, epicMiddleware] = createStoreEpicMiddleware(rootReducer);
  epicMiddleware.run(rootEpic);
  return store;
}

export function createPersistorStore(
  storage: Storage,
  storageKey?: string
): PersistorStore {
  const rootReducer = persistReducer(
    { key: storageKey || 'xmpp', storage, blacklist: ['available'] },
    reducers
  );
  const [store, epicMiddleware] = createStoreEpicMiddleware(rootReducer);
  const persistor = persistStore(store);
  epicMiddleware.run(rootEpic);
  return { store, persistor };
}

export interface PersistorStore {
  store: Store;
  persistor: Persistor;
}
