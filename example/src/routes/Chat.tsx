import React, { FC } from 'react';
import { useParams } from 'react-router-dom';
import { useMessages } from 'xmpp-react-hooks';

export interface ChatProps {}

export interface ChatParams {
  jid: string;
}

const Chat: FC<ChatProps> = (_props: ChatProps) => {
  const params = useParams<ChatParams>();
  const message = useMessages(params.jid);

  return (
    <>
      <h1>{JSON.stringify(params)}</h1>
      {/* <h1>{message.body}</h1> */}
      <h1>{JSON.stringify(message)}</h1>
    </>
  );
};

Chat.defaultProps = {};

export default Chat;
