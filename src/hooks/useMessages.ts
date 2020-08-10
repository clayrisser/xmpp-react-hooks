import { Message } from '@xmpp-ts/message';
import { useSelector } from 'react-redux';
import { State } from '../state';

export default function useMessages(): Message[] {
  return useSelector((state: State) => state.messages);
}
