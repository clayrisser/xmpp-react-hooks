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

  readMessages(callback: (message: Message) => any, to?: string) {
    if (!to) to = this.xmpp.fullJid!;
    this.xmpp.handle(
      (messageElement: XmlElement) => {
        return (
          messageElement.name === 'message' &&
          messageElement.getAttr('type') === 'chat' &&
          messageElement.getAttr('to') === to
        );
      },
      (messageElement: XmlElement) => {
        const message = this.elementToMessage(messageElement);
        callback(message);
      }
    );
  }

  elementToMessage(messageElement: XmlElement): Message {
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
