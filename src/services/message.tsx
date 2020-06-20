/**
 * @jsx xml
 * https://xmpp.org/rfcs/rfc6120.html#stanzas
 */
import xml from '@xmpp/xml';
import { xml as createXml, XmlFragment } from '@xmpp/client';
import StanzaService from './stanza';
import Xmpp from '../xmpp';
import XmppXml from '../xmppXml';

export default class MessageService extends StanzaService {
  constructor(private readonly xmpp: Xmpp) {
    super(xmpp);
  }

  async sendMessage(to: string, body: string, lang = 'en', from?: string) {
    if (!from) from = this.xmpp.fullJid;
    const request = createXml(
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
    if (!to) to = this.xmpp.fullJid;
    this.xmpp.handle(
      (messageStanza: XmlFragment) => {
        return (
          messageStanza.name === 'message' &&
          messageStanza.attrs.type === 'chat' &&
          messageStanza.attrs.to === to
        );
      },
      (messageStanza: XmlFragment) => {
        const message = this.messageStanzaToRoster(messageStanza);
        callback(message);
      }
    );
  }

  messageStanzaToRoster(messageStanza: XmlFragment): Message {
    const xmppXml = new XmppXml(messageStanza);
    const messageElement = Array.from(
      xmppXml.document.getElementsByTagName('message')
    )?.[0];
    const to = messageElement.getAttribute('to');
    const from = messageElement.getAttribute('from');
    const body = Array.from(messageElement.getElementsByTagName('body')).reduce(
      (body: string, bodyElement: Element) => {
        return [body, bodyElement.innerHTML].join('\n');
      },
      ''
    );
    const header =
      Array.from(messageElement.getElementsByTagName('header'))?.[0]
        .innerHTML || undefined;
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
