import React, { FC, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  useMessages,
  useMessageService,
  useMamService,
  useXmpp
} from 'xmpp-react-hooks';
import { MamMessage, Preferences } from '../../../lib';

export interface ChatProps {}

export interface ChatParams {
  jid: string;
}

const Chat: FC<ChatProps> = (_props: ChatProps) => {
  const messageService = useMessageService();
  const [_message, setMessage] = useState('');
  const mamService = useMamService();
  const params = useParams<ChatParams>();
  const xmpp = useXmpp();
  const message = useMessages(params.jid);
  const [data, setData] = useState<MamMessage[]>([]);

  const preference: Preferences = {
    always: [`${params!.jid}@test.siliconhills.dev`]
  };

  console.log('mam servicess', mamService);
  console.log('xmpp', xmpp!.jid);

  async function handleClick() {
    // console.log('params', params!.jid, message);
    await messageService!.sendMessage(
      `${params!.jid}@test.siliconhills.dev`,
      _message
    );
  }

  async function handleMamService() {
    const info = await mamService!.getMessages();
    setData(info);
  }

  function renderChat() {
    if (data.length > 0) {
      return data.map((item: any) => {
        return (
          <div>
            <p>{JSON.stringify(item)}</p>
          </div>
        );
      });
    }
  }

  async function updatePrefs() {
    await mamService!.updatePreferences();
  }
  async function getPrefs() {
    await mamService!.getPreference();
  }
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
      <br></br>
      <h1>{JSON.stringify(message)}</h1>
      <button onClick={() => handleMamService()}>Chat </button>
      {renderChat()}

      <button onClick={() => updatePrefs()}>updatePreferences</button>
      <button onClick={() => getPrefs()}>getPreferences</button>
    </>
  );
};

Chat.defaultProps = {};

export default Chat;
