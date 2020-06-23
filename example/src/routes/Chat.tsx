import React, { FC, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useXmpp, useMessageService, useMessage } from 'xmpp-react-hooks';

export interface ChatProps {}

export interface Params {
  jid: string;
}

const Chat: FC<ChatProps> = (_props: ChatProps) => {
  const params: Params = useParams();
  const xmpp = useXmpp();
  const messageService = useMessageService();
  const [message, setMessage] = useState('');

  async function handleClick() {
    console.log('params', params!.jid, message);
    await messageService!.sendMessage(
      `${params!.jid}@test.siliconhills.dev`,
      message
    );
  }

  return (
    <>
      <h1>{JSON.stringify(params)}</h1>
      <input
        id="message"
        name="message"
        onChange={(e: any) => setMessage(e.target.value)}
        value={message}
      />
      <button onClick={() => handleClick()}>Send Message</button>
    </>
  );
};

Chat.defaultProps = {};

export default Chat;
