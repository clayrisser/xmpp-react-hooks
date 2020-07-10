/**
 * @jsx xml
 * https://xmpp.org/rfcs/rfc6120.html#stanzas
 */
import xml from '@xmpp/xml';
import { XmlElement } from '@xmpp/client';
import StanzaClient from './stanza';
import Xmpp from '../xmpp';

export default class MessageClient extends StanzaClient {
  constructor(private readonly xmpp: Xmpp) {
    super(xmpp, 'jabber:client');
  }

  sendMessage({
    to,
    body,
    lang,
    from
  }: {
    to?: string;
    body?: string;
    lang?: string;
    from?: string;
  } = {}) {
    if (!from) from = this.xmpp.fullJid!;
    if (!lang) lang = this.xmpp.lang;
    const id = Date.now().toString();
    const request = xml(
      'message',
      {
        from,
        id,
        to,
        type: 'chat',
        'xml:lang': lang
      },
      <body>{body}</body>
    );
    // TODO: resolve query on server ack
    this.xmpp.query(request);
  }

  readSentMessages(
    callback: (message: Message) => any,
    {
      to,
      from
    }: {
      to?: string;
      from?: string;
    } = {}
  ): () => any {
    if (!from) from = this.xmpp.fullJid!;
    return this.xmpp.handle(
      (messageElement: XmlElement) => {
        return (
          messageElement.getAttr('type') === 'chat' &&
          messageElement.getAttr('xmlns') === this.namespaceName &&
          messageElement.name === 'message' &&
          messageElement.getAttr('from')?.split('/')[0] ===
            from?.split('/')[0] &&
          (!to ||
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
    {
      from,
      to
    }: {
      from?: string;
      to?: string;
    } = {}
  ): () => any {
    if (!to) to = this.xmpp.fullJid!;
    return this.xmpp.handle(
      (messageElement: XmlElement) => {
        return (
          messageElement.getAttr('to')?.split('/')[0] === to?.split('/')[0] &&
          messageElement.getAttr('type') === 'chat' &&
          messageElement.getAttr('xmlns') === this.namespaceName &&
          messageElement.name === 'message' &&
          (!from ||
            messageElement.getAttr('from')?.split('/')[0] ===
              from?.split('/')[0])
        );
      },
      async (messageElement: XmlElement) => {
        const message = this.elementToMessage(messageElement);
        callback(message);
      }
    );
  }

  elementToMessage(messageElement: XmlElement): Message {
    const archivedElement = messageElement.getChild('archived');
    const from = messageElement.getAttr('from');
    const header = messageElement.getChild('header')?.text() || undefined;
    const id = messageElement.getAttr('id');
    const stamp = new Date();
    const lang = messageElement.getAttr('xml:lang');
    const archivedId = archivedElement?.getAttr('id');
    const to = messageElement.getAttr('to');
    const body = messageElement
      .getChildren('body')
      .reduce((body: string, bodyElement: XmlElement) => {
        return [body, bodyElement.text()].join('\n');
      }, '');
    if (body && from && to && id) {
      return { body, from, to, header, stamp, id, archivedId, lang };
    }
    throw new Error('invalid message stanza');
  }
}

export interface Message {
  archivedId?: string;
  body: string;
  from: string;
  header?: string;
  id: string;
  lang?: string;
  stamp?: Date;
  to: string;
}
