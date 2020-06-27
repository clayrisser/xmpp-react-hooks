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
    super(xmpp, 'jabber:client');
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

  readSentMessages(
    callback: (message: Message) => any,
    to?: string,
    from?: string
  ): () => any {
    if (!from) from = this.xmpp.fullJid!;
    return this.xmpp.handle(
      (messageElement: XmlElement) => {
        return (
          !messageElement.getChild('result') &&
          messageElement.getAttr('type') === 'chat' &&
          messageElement.getAttr('xmlns') === this.namespaceName &&
          messageElement.name === 'message' &&
          messageElement.getAttr('from')?.split('/')[0] ===
            from?.split('/')[0] &&
          (!to?.length ||
            messageElement.getAttr('to')?.split('/')[0] === to?.split('/')[0])
        );
      },
      (messageElement: XmlElement) => {
        const message = this.elementToMessage(messageElement);
        callback(message);
      },
      'send'
    );
  }

  readMessages(
    callback: (message: Message) => any,
    from?: string,
    to?: string
  ): () => any {
    if (!to) to = this.xmpp.fullJid!;
    return this.xmpp.handle(
      (messageElement: XmlElement) => {
        return (
          !messageElement.getChild('result') &&
          messageElement.getAttr('to')?.split('/')[0] === to?.split('/')[0] &&
          messageElement.getAttr('type') === 'chat' &&
          messageElement.getAttr('xmlns') === this.namespaceName &&
          messageElement.name === 'message' &&
          (!from?.length ||
            messageElement.getAttr('from')?.split('/')[0] ===
              from?.split('/')[0])
        );
      },
      (messageElement: XmlElement) => {
        const message = this.elementToMessage(messageElement);
        callback(message);
      }
    );
  }

  elementToMessage(messageElement: XmlElement): Message {
    const from = messageElement.getAttr('from');
    const header = messageElement.getChild('header')?.text() || undefined;
    const id = messageElement.getAttr('id');
    const stamp = new Date();
    const to = messageElement.getAttr('to');
    const body = messageElement
      .getChildren('body')
      .reduce((body: string, bodyElement: XmlElement) => {
        return [body, bodyElement.text()].join('\n');
      }, '');
    if (body && from && to && id) {
      return { body, from, to, header, stamp, id };
    }
    throw new Error('invalid message stanza');
  }
}

export interface Message {
  body: string;
  from: string;
  header?: string;
  id: string;
  stamp?: Date;
  to: string;
}
