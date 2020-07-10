/**
 * @jsx xml
 * https://xmpp.org/extensions/xep-0313.html
 */
import xml from '@xmpp/xml';
import { XmlElement } from '@xmpp/client';
import StanzaClient from './stanza';
import Xmpp, { Cleanup } from '../xmpp';
import { Message } from './message';

export default class MamClient extends StanzaClient {
  constructor(protected readonly xmpp: Xmpp) {
    super(xmpp, 'urn:xmpp:mam:2');
  }

  readMessages(
    callback: (message: MamMessage) => any,
    {
      queryId
    }: {
      queryId?: string;
    }
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
      (messageElement: XmlElement) => {
        const mamMessage = this.elementToMamMessage(messageElement);
        console.log('MAMMMM', mamMessage);
        if (typeof mamMessage === 'undefined') return;
        return callback(mamMessage);
      }
    );
  }

  async getMessages({
    after,
    end,
    id,
    max,
    start,
    withJid
  }: {
    after?: number;
    end?: string;
    id?: string;
    max?: number;
    start?: string;
    withJid?: string;
  } = {}): Promise<MamMessage[]> {
    if (!id) id = Date.now().toString();
    const children = [];
    const withField = withJid ? (
      <field var="with">
        <value>{withJid}</value>
      </field>
    ) : null;
    const startField = start ? (
      <field var="start">
        <value>{start}</value>
      </field>
    ) : null;
    const endField = end ? (
      <field var="end">
        <value>{end}</value>
      </field>
    ) : null;
    if (max) {
      children.push(<max>{max}</max>);
      if (after) children.push(<after>{after}</after>);
    }
    const request = (
      <iq type="set" id={id}>
        <query xmlns={this.namespaceName} queryid={id}>
          <x xmlns="jabber:x:data" type="submit">
            <field var="FORM_TYPE" type="hidden">
              <value>urn:xmpp:mam:2</value>
            </field>
            {withField}
            {startField}
            {endField}
          </x>
          {max && <set xmlns="http://jabber.org/protocol/rsm">{children}</set>}
        </query>
      </iq>
    );
    const mamMessages: MamMessage[] = [];
    const cleanup = this.readMessages(
      (mamMessage: MamMessage) => mamMessages.push(mamMessage),
      { queryId: id }
    );
    const iqElement = await this.xmpp.query(request, [this.namespaceName, id]);
    cleanup();
    const err = this.getIqError(iqElement);
    if (err) throw err;
    return mamMessages;
  }

  elementToMamMessage(messageElement: XmlElement): MamMessage | void {
    const resultElement = messageElement.getChild('result');
    if (!resultElement) return;
    const queryId = resultElement.getAttr('queryid');
    const forwardedElement = resultElement.getChild('forwarded');
    if (!forwardedElement) return;
    const childMessageElement = forwardedElement.getChild('message');
    const deleyElement = forwardedElement.getChild('delay');
    if (!childMessageElement || !deleyElement) return;
    const from = childMessageElement.getAttr('from');
    const id = childMessageElement.getAttr('id');
    const stamp = new Date(deleyElement.getAttr('stamp'));
    const to = childMessageElement.getAttr('to');
    const header = childMessageElement.getChild('header')?.getText();
    const body = childMessageElement.getChild('body')?.text();
    if (id && typeof body !== 'undefined' && from && to) {
      return {
        body,
        from,
        header,
        id,
        mam: true,
        queryId,
        stamp,
        to
      };
    }
  }

  async getPreference({ id }: { id?: string } = {}): Promise<any> {
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

  async updatePreferences({
    _preferences,
    id
  }: {
    _preferences: Preferences;
    id?: string;
  }): Promise<void> {
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
  queryId?: string;
}

export interface Preferences {
  always?: string[];
  never?: string[];
}
