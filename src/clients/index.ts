import MamClient, { MamMessage } from './mam';
import MessageClient from './message';
import PresenceClient from './presence';
import RosterClient, { RosterItem } from './roster';
import StanzaClient from './stanza';
import RegisterClient from './register';

export {
  MamClient,
  MessageClient,
  PresenceClient,
  RosterClient,
  StanzaClient,
  RegisterClient,
  RosterItem,
  MamMessage
};

export * from './mam';
export * from './message';
export * from './presence';
export * from './roster';
export * from './stanza';
export * from './register';
