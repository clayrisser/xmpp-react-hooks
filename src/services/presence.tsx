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
    // if (!type) type = 'subscribe';
    // if (!from) from = 'jayanth@test.siliconhills.dev';
    // if (!to) to = 'navya@test.siliconhills.dev';
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

  // async updatePresence(to?: string) {
  //   const request = (
  //     <presence type="subscribe" to="navya@test.siliconhills.dev" />
  //   );

  //   //   // TODO: add condition
  //   const value = await this.xmpp.query(request);
  //   console.log('value', value);
  // }

  // async getPreference() {
  //   const request = (
  //     <presence
  //       type="probe"
  //       from="jayanth@test.siliconhills.dev"
  //       to="navya@test.siliconhills.dev"
  //     />
  //   );
  //   const value123 = await this.xmpp.query(request);
  //   console.log('value', value123);
  // }
}
