import React, { FC } from 'react';
import { useXmpp, useStatus } from 'xmpp-react-hooks';

export interface ChatListProps {}

const ChatList: FC<ChatListProps> = (_props: ChatListProps) => {
  const xmpp = useXmpp();
  const status = useStatus();

  return (
    <>
      <h1>Chat List</h1>
      <div>xmpp: {JSON.stringify(!!xmpp?.client)}</div>
      <div>status: {JSON.stringify(status)}</div>
    </>
  );
};

ChatList.defaultProps = {};

export default ChatList;
