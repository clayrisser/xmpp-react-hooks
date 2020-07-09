import { XmlElement } from '@xmpp/client';
import Xmpp from '../xmpp';

export default class StanzaService {
  constructor(xmpp: Xmpp, public readonly namespaceName = '') {
    if (!xmpp.client) throw new Error('login to access xmpp client');
  }

  protected getIqError(iqElement: XmlElement): Error | undefined {
    const errorElement = iqElement.getChild('error');
    if (!errorElement) return;
    const err: any = new Error(errorElement.toString());
    err.stanza = iqElement;
    return err;
  }
}

export enum IqType {
  GET = 'get',
  PUSH = 'push',
  RESULT = 'result',
  SET = 'set'
}
