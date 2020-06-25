/**
 * @jsx xml
 * https://xmpp.org/extensions/xep-0313.html
 */
import xml from '@xmpp/xml';
import { XmlElement } from '@xmpp/client';
import StanzaService from './stanza';
import Xmpp, { Cleanup } from '../xmpp';

export default class MAMService extends StanzaService {
  constructor(private readonly xmpp: Xmpp) {
    super(xmpp, 'urn:xmpp:mam:2');
  }

  readMessages(
    callback: (message: MamMessage) => any,
    queryId?: string
  ): Cleanup {
    return this.xmpp.handle(
      (messageElement: XmlElement) => {
        const resultElement = messageElement.getChild('result');
        if (!resultElement) return false;
        return (
          messageElement.name === 'message' &&
          resultElement.getAttr('xmlns') === this.namespaceName &&
          (!queryId || resultElement.getAttr('queryid') === queryId)
        );
      },
      (iqElement: XmlElement) => {
        const mamMessage = this.elementToMamMessage(iqElement);
        if (typeof mamMessage === 'undefined') return () => {};
        return callback(mamMessage);
      }
    );
  }

  async getMessages(withJid?: string, id?: string): Promise<MamMessage[]> {
    if (!id) id = Date.now().toString();
    const withField = withJid ? (
      <field var="with">
        <value>{withJid}</value>
      </field>
    ) : null;
    const request = (
      <iq type="set" id={id}>
        <query xmlns={this.namespaceName} queryid={id}>
          <x xmlns="jabber:x:data" type="submit">
            <field var="FORM_TYPE" type="hidden">
              <value>urn:xmpp:mam:2</value>
            </field>
            {withField}
          </x>
        </query>
      </iq>
    );
    const mamMessages: MamMessage[] = [];
    const cleanup = this.readMessages(
      (mamMessage: MamMessage) => mamMessages.push(mamMessage),
      id
    );
    const iqElement = await this.xmpp.query(request, [this.namespaceName, id]);
    cleanup();
    const err = this.getIqError(iqElement);
    if (err) throw err;
    return mamMessages;
  }

  elementToMamMessage(messageElement: XmlElement): MamMessage | void {
    const resultElement = messageElement.getChild('result');
    if (typeof resultElement === 'undefined') return;
    const forwardedElement = resultElement.getChild('forwarded');
    if (typeof forwardedElement === 'undefined') return;
    const childMessageElement = forwardedElement.getChild('message');
    const deleyElement = forwardedElement.getChild('delay');
    if (
      typeof childMessageElement === 'undefined' ||
      typeof deleyElement === 'undefined'
    ) {
      return;
    }
    const body = childMessageElement.getChild('body');
    const to = childMessageElement.getAttr('to');
    const from = childMessageElement.getAttr('from');
    const stamp = new Date(deleyElement.getAttr('stamp'));
    const header = childMessageElement.getAttr('header');
    return {
      body: body!.children[0].toString(),
      to,
      from,
      stamp,
      header,
      mam: true
    };
  }

  async getPreference(id?: string): Promise<any> {
    if (!id) id = Date.now().toString();
    const request = (
      <iq type="get" id={id}>
        <prefs xmlns={this.namespaceName} />
      </iq>
    );
    const iqElement = await this.xmpp.query(request, [this.namespaceName, id]);
    const err = this.getIqError(iqElement);
    console.log('error', err);
    if (err) throw err;
    console.log('prefs', iqElement);
    return this.elementToPreference(iqElement);
    // return {
    // always: [],
    // never: []
    // };
  }

  elementToPreference(preferenceElement: XmlElement): Preferences | void {
    const resultElement = preferenceElement.getChild('prefs');
    if (typeof resultElement === 'undefined') return;
    const alwaysElement = resultElement.getChild('always');
    if (typeof alwaysElement === 'undefined') return;
    const neverElement = resultElement.getChild('never');
    if (typeof neverElement === 'undefined') return;

    const jidAlwaysElement = alwaysElement.getChildren('jid').map(
      (groupElement: XmlElement) => console.log('jidsssss', groupElement.text())
      // groupElement.text()
    );
    if (typeof jidAlwaysElement === 'undefined') return;

    const jidNeverElement = neverElement.getChild('jid');
    console.log('jidss', jidAlwaysElement);
    // return {
    // };
  }

  async updatePreferences(
    // _preferences: Preferences,
    id?: string
  ): Promise<void> {
    if (!id) id = Date.now().toString();

    const request = (
      <iq type="set" id={id}>
        <prefs xmlns="urn:xmpp:mam:2" default="roster">
          <always>
            <jid>jam@test.siliconhills.dev</jid>
            <jid>jayanth@test.siliconhills.dev</jid>
          </always>
          {/* <never>
            <jid>montague@montague.lit</jid>
          </never> */}
        </prefs>
      </iq>
    );
    const iqElement = await this.xmpp.query(request, [this.namespaceName, id]);
    console.log('iqelement', iqElement);
    const err = this.getIqError(iqElement);
    console.log('error', err);
    if (err) throw err;
  }
}

export interface MamMessage {
  body: string;
  to: string;
  from: string;
  stamp: Date;
  mam: boolean;
  header?: string;
}

export interface Preferences {
  always?: string[];
  never?: string[];
}
