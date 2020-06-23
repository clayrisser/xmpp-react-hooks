import React, { FC } from 'react';
import { useParams } from 'react-router-dom';
import { useXmpp } from 'xmpp-react-hooks';

export interface ChatProps {}

const Chat: FC<ChatProps> = (_props: ChatProps) => {
  const params = useParams();
  const xmpp = useXmpp();

  return (
    <>
      <h1>{JSON.stringify(params)}</h1>
    </>
  );
};

Chat.defaultProps = {};

export default Chat;
