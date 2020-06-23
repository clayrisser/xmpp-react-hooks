import React, { FC, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useMessages, useMessageService } from 'xmpp-react-hooks';

export interface ChatProps {}

export interface ChatParams {
  jid: string;
}

const Chat: FC<ChatProps> = (_props: ChatProps) => {
  const messageService = useMessageService();
  const [_message, setMessage] = useState('');

  async function handleClick() {
    console.log('params', params!.jid, message);
    await messageService!.sendMessage(
      `${params!.jid}@test.siliconhills.dev`,
      _message
    );
  }
  const params = useParams<ChatParams>();
  const message = useMessages(params.jid);

  return (
    <>
      <h1>{JSON.stringify(params)}</h1>
      <input
        id="message"
        name="message"
        onChange={(e: any) => setMessage(e.target.value)}
        value={_message}
      />
      <button onClick={() => handleClick()}>Send Message</button>
      {/* <h1>{message.body}</h1> */}
      <h1>{JSON.stringify(message)}</h1>
    </>
  );
};

Chat.defaultProps = {};

export default Chat;
