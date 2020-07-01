/**
 * @jsx xml
 * https://xmpp.org/extensions/xep-0313.html
 */
import xml from '@xmpp/xml';
import { XmlElement } from '@xmpp/client';
import StanzaService from './stanza';
import Xmpp, { Cleanup } from '../xmpp';
import { Message } from './message';

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
    const from = childMessageElement.getAttr('from');
    const id = messageElement.getAttr('id');
    const stamp = new Date(deleyElement.getAttr('stamp'));
    const to = childMessageElement.getAttr('to');
    const header =
      childMessageElement.getChild('header')?.getText() || undefined;
    const body = childMessageElement
      .getChildren('body')
      .reduce((body: string, bodyElement: XmlElement) => {
        return [body, bodyElement.text()].join('\n');
      }, '');
    if (id && body && from && to) {
      return {
        body,
        from,
        header,
        id,
        mam: true,
        stamp,
        to
      };
    }
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
    if (err) throw err;
    return this.elementToPreference(iqElement);
  }

  elementToPreference(preferenceElement: XmlElement): Preferences[] | void {
    let neverElement: any;
    let alwaysElement: any;
    return preferenceElement
      .getChildren('prefs')
      .reduce((preference: Preferences[], queryElement: XmlElement) => {
        queryElement.getChildren('never').forEach((itemElement: XmlElement) => {
          if (itemElement.getChildren('jid')) {
            neverElement = itemElement
              .getChildren('jid')
              .map((groupElement: XmlElement) => groupElement.text());
          }
        });
        queryElement
          .getChildren('always')
          .forEach((itemElement: XmlElement) => {
            alwaysElement = itemElement
              .getChildren('jid')
              .map((groupElement: XmlElement) => groupElement.text());
          });
        preference.push({ never: neverElement, always: alwaysElement });
        return preference;
      }, []);
  }

  async updatePreferences(
    _preferences: Preferences,
    id?: string
  ): Promise<void> {
    if (!id) id = Date.now().toString();
    const request = (
      <iq type="set" id={id}>
        <prefs xmlns={this.namespaceName} default="roster">
          <always>
            <jid>{`${_preferences.always}@test.siliconhills.dev`}</jid>
          </always>
          <never>
            <jid>{`${_preferences.never}@test.siliconhills.dev`}</jid>
          </never>
        </prefs>
      </iq>
    );
    const iqElement = await this.xmpp.query(request, [this.namespaceName, id]);
    const err = this.getIqError(iqElement);
    if (err) throw err;
  }
}

export interface MamMessage extends Message {
  mam: boolean;
}

export interface Preferences {
  always?: string[];
  never?: string[];
}
