/**
 * @jsx xml
 * https://xmpp.org/extensions/xep-0077.html
 */
import xml from '@xmpp/xml';
import { XmlElement } from '@xmpp/client';
import StanzaClient from './stanza';
import Xmpp from '../xmpp';

export default class RegisterClient extends StanzaClient {
  constructor(private readonly xmpp: Xmpp) {
    super(xmpp, 'jabber:iq:register');
  }

  async requestRegister(id?: string) {
    if (!id) id = Date.now().toString();
    const request = (
      // <iq type="get" id={id} to="test.siliconhills.dev">
      //   <query xmlns={this.namespaceName} />
      // </iq>
      <iq type="set" id={id} to="test.siliconhills.dev">
        <query xmlns={this.namespaceName}>
          <username>vhgg</username>
          <password>Calliope</password>
          <email>bard@shakespeare.lit</email>
        </query>
      </iq>
    );
    return await this.xmpp.query(request, [this.namespaceName, id]);
  }
}
