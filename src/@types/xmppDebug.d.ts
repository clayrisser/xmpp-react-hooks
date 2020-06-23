declare module '@xmpp/debug' {
  import { XmppClient } from '@xmpp/client';

  function xmppDebug(xmpp: XmppClient, debug?: boolean): any;
  export = xmppDebug;
}
