import '@testing-library/jest-dom/vitest';
import { WebSocket as NodeWebSocket } from 'ws';

/**
 * jsdom installs its own `Event` class, while Node's built-in WebSocket
 * dispatches Node's `Event`; the two are structurally identical and
 * `instanceof`-incompatible, so every connection dies with "The 'event'
 * argument must be an instance of Event. Received an instance of Event".
 *
 * `ws` dispatches its own event objects and never touches jsdom's EventTarget,
 * which is what `@xmpp/websocket` needs from a `WebSocket` global anyway.
 */
globalThis.WebSocket = NodeWebSocket as unknown as typeof WebSocket;
