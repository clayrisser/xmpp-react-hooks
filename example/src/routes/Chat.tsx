import React, { FC, useState } from 'react';
import { useMessages, useMessageService } from 'xmpp-react-hooks';
import { useParams } from 'react-router-dom';

export interface ChatProps {}

export interface ChatParams {
  jid: string;
}

const Chat: FC<ChatProps> = (_props: ChatProps) => {
  const params = useParams<ChatParams>();
  const [message, setMessage] = useState('');
  const messages = useMessages(params.jid);
  const messageService = useMessageService();

  async function handleSendMessage(
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) {
    e.preventDefault();
    messageService?.sendMessage({
      to: `${params!.jid}@test.siliconhills.dev`,
      body: message
    });
  }

  return (
    <>
      <form>
        <input
          id="message"
          name="message"
          onChange={(e: any) => setMessage(e.target.value)}
          value={message}
        />
        <button onClick={handleSendMessage}>Send Message</button>
      </form>
      {JSON.stringify(messages)}
    </>
  );
};

Chat.defaultProps = {};

export default Chat;
