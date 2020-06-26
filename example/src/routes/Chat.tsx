import React, { FC, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  useMessages,
  useMessageService,
  useMamService,
  useXmpp,
  useRoster
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
  const roster = useRoster();
  const params = useParams<ChatParams>();
  const xmpp = useXmpp();
  const message = useMessages(params.jid);
  const [data, setData] = useState<MamMessage[]>([]);
  // const preference: Preferences = {
  //   always: [`${params!.jid}@test.siliconhills.dev`],
  //   never: ['navya@test.siliconhills.dev']
  // };
  const [always, setAlways] = useState();
  const [never, setNever] = useState();
  const [preferencedata, setPreference] = useState<Preferences[]>([]);

  console.log('mam servicess', mamService);
  // console.log('xmpp', xmpp!.jid);

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

  function renderPreferences() {
    console.log('preferenced data', preferencedata[0]);
    if (!preferencedata[0]) return;
    const always = preferencedata[0].always;
    const never = preferencedata[0].never;

    if (!always) return;
    if (!never) return;
    return (
      <div>
        <p>Never:</p>
        {never.map((item: any) => {
          return (
            <div>
              <p>{JSON.stringify(item)}</p>
            </div>
          );
        })}
        <p>Always:</p>
        {always.map((item: any) => {
          return (
            <div>
              <p>{JSON.stringify(item)}</p>
            </div>
          );
        })}
      </div>
    );
  }

  async function updatePrefs() {
    await mamService!.updatePreferences({ always, never });
  }
  async function getPrefs() {
    const preferences = await mamService!.getPreference();
    setPreference(preferences);
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
      <br></br>
      {renderChat()}
      <br></br>
      <label>Always:</label>
      <input
        id="preference"
        name="preference"
        onChange={(e: any) => setAlways(e.target.value)}
        value={always}
      />
      <label>Never:</label>
      <input
        id="never"
        name="never"
        onChange={(e: any) => setNever(e.target.value)}
        value={never}
      />
      <button onClick={() => updatePrefs()}>updatePreferences</button>
      <button onClick={() => getPrefs()}>getPreferences</button>
      {renderPreferences()}
    </>
  );
};

Chat.defaultProps = {};

export default Chat;
