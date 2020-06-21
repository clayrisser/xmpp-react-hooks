/**
 * @jsx xml
 * https://xmpp.org/rfcs/rfc3921.html#presence
 */
import xml from '@xmpp/xml';
import StanzaService from './stanza';
import Xmpp from '../xmpp';

export default class PresenceService extends StanzaService {
  constructor(private readonly xmpp: Xmpp) {
    super(xmpp);
  }

  async sendPresence(status?: string, lang?: string) {
    if (!lang) lang = this.xmpp.lang!;
    const request = xml(
      'presence',
      {
        'xml:lang': lang
      },
      status?.length ? <status>{status}</status> : []
    );
    // TODO: add condition
    await this.xmpp.query(request);
  }
}
