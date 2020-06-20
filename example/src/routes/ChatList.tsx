import React, { FC } from 'react';
import { useXmpp } from 'xmpp-react-hooks';

export interface ChatListProps {}

const ChatList: FC<ChatListProps> = (_props: ChatListProps) => {
  const xmpp = useXmpp();
  return (
    <>
      <h1>Chat List</h1>
      <div>xmpp: {JSON.stringify(!!xmpp?.client)}</div>
    </>
  );
};

ChatList.defaultProps = {};

export default ChatList;
