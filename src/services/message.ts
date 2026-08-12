import type { MessageClientOptions } from '@xmpp-ts/message';
import { MessageClient } from '../xmppTs.js';

export interface MessageServiceOptions extends MessageClientOptions {}

/**
 * Named subclass so the package owns the type consumers see, and so a
 * behavioural fix has somewhere to live — as roster and presence needed.
 */
export default class MessageService extends MessageClient {}
