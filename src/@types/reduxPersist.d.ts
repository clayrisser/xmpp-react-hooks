/**
 * `redux-persist/integration/react` is a directory entry, which Node's ESM
 * loader refuses to resolve, so `Provider` imports the CJS file behind it
 * directly. redux-persist keeps its declarations under `types/`, a layout that
 * does not line up with that path, hence this alias.
 */
declare module 'redux-persist/lib/integration/react.js' {
  export { PersistGate } from 'redux-persist/integration/react';
}
