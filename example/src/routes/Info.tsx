import React, { FC } from 'react';
import { useStatus, useRoster } from 'xmpp-react-hooks';
import Loading from '../components/Loading';

export interface ChatListProps {}

const ChatList: FC<ChatListProps> = (_props: ChatListProps) => {
  const roster = useRoster();
  const status = useStatus();

  if (!status.isReady) return <Loading />;
  return (
    <>
      <h1>Chat List</h1>
      <div>status: {JSON.stringify(status)}</div>
      <div>roster: {JSON.stringify(roster)}</div>
    </>
  );
};

ChatList.defaultProps = {};

export default ChatList;
