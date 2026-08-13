import { VCardClient } from '../xmppTs.js';

/**
 * Named subclass so the package owns the type consumers see, and so a
 * behavioural fix has somewhere to live — as roster and presence needed.
 */
export default class VCardService extends VCardClient {}
