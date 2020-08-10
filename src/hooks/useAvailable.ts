import Jid from '@xmpp-ts/jid';
import { useSelector } from 'react-redux';
import { State } from '../state';

export default function useAvailable(): Jid[] {
  const available = useSelector((state: State) => state.available);
  return available.map((jid: string) => new Jid(jid));
}
