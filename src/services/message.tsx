/**
 * @jsx xml
 * https://xmpp.org/rfcs/rfc6120.html#stanzas
 */
import xml from '@xmpp/xml';
import { XmlElement } from '@xmpp/client';
import StanzaService from './stanza';
import Xmpp from '../xmpp';

export default class MessageService extends StanzaService {
  constructor(private readonly xmpp: Xmpp) {
    super(xmpp);
  }

  async sendMessage(to: string, body: string, lang?: string, from?: string) {
    if (!from) from = this.xmpp.fullJid!;
    if (!lang) lang = this.xmpp.lang;
    const request = xml(
      'message',
      {
        to,
        from,
        type: 'chat',
        'xml:lang': lang
      },
      <body>{body}</body>
    );
    await this.xmpp.query(request);
  }

  readMessages(callback: (message: any) => any, to?: string) {
    console.log('hello world');
    if (!to) to = this.xmpp.fullJid!;
    console.log('to', to);
    this.xmpp.handle(
      (messageElement: XmlElement) => {
        console.log('messages1234', messageElement);

        return (
          messageElement.name === 'message' &&
          messageElement.getAttr('type') === 'chat' &&
          messageElement.getAttr('to') === to
        );
      },
      (messageElement: XmlElement) => {
        const message = this.elementToMessage(messageElement);
        console.log('messages123', messageElement);
        callback(message);
      }
    );
  }

  elementToMessage(messageElement: XmlElement): Message {
    console.log('test123');
    const to = messageElement.getAttr('to');
    const from = messageElement.getAttr('from');
    const body = messageElement
      .getChildren('body')
      .reduce((body: string, bodyElement: XmlElement) => {
        return [body, bodyElement.text()].join('\n');
      }, '');
    const header = messageElement.getChild('header')?.text() || undefined;
    if (body && from && to) return { body, from, to, header };
    throw new Error('invalid message stanza');
  }
}

export interface Message {
  body: string;
  from: string;
  header?: string;
  to: string;
}
