import xmlEscape from 'xml-escape';
import { DOMParser } from 'xmldom';
import { XmlFragment } from '@xmpp/client';

const domParser = new DOMParser();

export default class XmppXml {
  document: Document;
  text: string;

  constructor(fragment: XmlFragment) {
    this.text = this.stringifyXmppFragment(fragment);
    this.document = domParser.parseFromString(this.text);
  }

  stringifyXmppFragment(fragments: XmlFragment | XmlFragment[], indent = 0) {
    if (!Array.isArray(fragments)) fragments = [fragments];
    const padding = Array.from(Array(indent))
      .map(() => ' ')
      .join('');
    return fragments.reduce((xml: string, fragment: XmlFragment) => {
      let children = this.stringifyXmppFragment(fragment.children, indent + 2);
      children = children.length
        ? `>\n${padding}${children}
${padding}</${fragment.name}>`
        : `></${fragment.name}>`;
      xml = `${xml ? xml + '\n' : ''}${padding}<${
        fragment.name
      }${this.stringifyXmppFragmentAttrs(fragment)}${children}`;
      return xml;
    }, '');
  }

  stringifyXmppFragmentAttrs(fragment: XmlFragment) {
    return Object.entries(fragment.attrs).reduce(
      (attrsString: string, [key, value]: [string, string]) => {
        return `${attrsString} ${key}="${xmlEscape(value)}"`;
      },
      ''
    );
  }
}
