import RosterService from '../services/roster';
import useXmpp from './useXmpp';

export default function useRosterService(): RosterService | undefined {
  const xmppClient = useXmpp();
  return xmppClient?.services?.roster;
}
