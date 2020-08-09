import { XmppClient } from '@xmpp/client';
import PresenceClient, {
  PresenceClientOptions,
  PresenceType
} from '@xmpp-ts/presence';

export interface PresenceServiceOptions extends PresenceClientOptions {}

export default class PresenceService extends PresenceClient {
  constructor(client: XmppClient, options: Partial<PresenceServiceOptions>) {
    super(client, {
      defaultSubscribeResponse: PresenceType.SUBSCRIBED,
      ...options
    });
  }
}
