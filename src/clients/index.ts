import MamClient from './mam';
import MessageClient from './message';
import PresenceClient from './presence';
import RegisterClient from './register';
import RosterClient, { RosterItem } from './roster';
import StanzaClient from './stanza';

export {
  MamClient,
  MessageClient,
  PresenceClient,
  RosterClient,
  StanzaClient,
  RegisterClient,
  RosterItem
};

export * from './mam';
export * from './message';
export * from './presence';
export * from './register';
export * from './roster';
export * from './stanza';
