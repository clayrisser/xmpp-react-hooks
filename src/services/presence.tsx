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

  async sendPresence(
    status?: string,
    type?: string,
    to?: string,
    from?: string,
    lang?: string
  ) {
    if (!lang) lang = this.xmpp.lang!;
    if (!type) type = 'subscribe';
    if (!from) from = 'jayanth@test.siliconhills.dev';
    if (!to) to = 'navya@test.siliconhills.dev';
    const request = (
      <presence
        xml="lang"
        to="navya@test.siliconhills.dev"
        from="jayanth@test.siliconhills.dev"
        type="subscribe"
      ></presence>
    );
    const test = await this.xmpp.query(request);
  }
}
