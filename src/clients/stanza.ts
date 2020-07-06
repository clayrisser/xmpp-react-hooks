import { XmlElement } from '@xmpp/client';
import Xmpp from '../xmpp';

export default class StanzaService {
  constructor(xmpp: Xmpp, public readonly namespaceName = '') {
    if (!xmpp.client) throw new Error('login to access xmpp client');
  }

  protected lookupIqType(subscription?: string): IqType | undefined;
  protected lookupIqType(subscription?: IqType): string | undefined;
  protected lookupIqType(
    subscription?: IqType | string
  ): IqType | string | undefined {
    if (typeof subscription === 'string') {
      switch (subscription) {
        case 'get':
          return IqType.GET;
        case 'push':
          return IqType.PUSH;
        case 'result':
          return IqType.RESULT;
        case 'set':
          return IqType.SET;
        default:
          return;
      }
    }
    switch (subscription) {
      case IqType.GET:
        return 'get';
      case IqType.PUSH:
        return 'push';
      case IqType.RESULT:
        return 'result';
      case IqType.SET:
        return 'set';
      default:
        return;
    }
  }

  getIqError(iqElement: XmlElement): Error | undefined {
    const errorElement = iqElement.getChild('error');
    if (!errorElement) return;
    const err: any = new Error(errorElement.toString());
    err.stanza = iqElement;
    return err;
  }
}

export enum IqType {
  GET,
  PUSH,
  RESULT,
  SET
}
