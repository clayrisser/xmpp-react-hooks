import { type Storage, type Persistor, persistReducer, persistStore } from 'redux-persist';
import {
  type Reducer,
  type Store,
  type StoreEnhancer,
  applyMiddleware,
  compose,
  createStore as reduxCreateStore
} from 'redux';
import reducers from './reducers/index.js';
import type { State } from './state.js';

/**
 * Redux DevTools when the extension is installed, plain compose otherwise.
 * Inlined because the `redux-devtools-extension` package this used to import
 * has been unmaintained since 2021 and only ever did this.
 */
function composeEnhancers(...enhancers: StoreEnhancer[]): StoreEnhancer {
  const devTools = (
    globalThis as {
      __REDUX_DEVTOOLS_EXTENSION_COMPOSE__?: typeof compose;
    }
  ).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__;
  return (devTools ?? compose)(...enhancers) as StoreEnhancer;
}

// No preloaded state is passed: every reducer already defaults to its slice of
// `defaultState`, and redux 5 types a partial preload as `never`.
export function createStore(): Store<State> {
  return reduxCreateStore(reducers) as unknown as Store<State>;
}

export function createPersistorStore(storage: Storage, storageKey?: string): PersistorStore {
  const rootReducer = persistReducer(
    { key: storageKey || 'xmpp', storage, blacklist: ['available'] },
    reducers as unknown as Reducer<State>
  );
  const store = reduxCreateStore(
    rootReducer,
    composeEnhancers(applyMiddleware())
  ) as unknown as Store<State>;
  return { store, persistor: persistStore(store) };
}

export interface PersistorStore {
  store: Store<State>;
  persistor: Persistor;
}
