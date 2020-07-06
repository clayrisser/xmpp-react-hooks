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
    lang?: string,
    id?: string
  ) {
    if (!lang) lang = this.xmpp.lang!;
    if (!type) type = 'subscribe';
    if (!from) from = 'jayanth@test.siliconhills.dev';
    if (!to) to = 'navya@test.siliconhills.dev';
    const request = <presence />;
    const test = await this.xmpp.query(request);
  }

  async acceptPresence() {
    const request = (
      <presence
        from="navya@test.siliconhills.dev"
        id={Date.now()}
        to="jayanth12@test.siliconhills.dev"
        type="subscribed"
      />
    );
    const accept = await this.xmpp.query(request);
    console.log('accept', accept);
  }
}
