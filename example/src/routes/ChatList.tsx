import React, { FC, useEffect, useState } from 'react';
import {
  useRoster,
  RosterItem,
  useRegisterService,
  useRosterService,
  useXmpp
} from 'xmpp-react-hooks';
import { useHistory } from 'react-router-dom';
import Loading from '../components/Loading';

export interface ChatListProps {}

const ChatList: FC<ChatListProps> = (_props: ChatListProps) => {
  const history = useHistory();
  const roster = useRoster();
  const [jid, setJid] = useState('');

  console.log('roster', roster);

  function handleClick(rosterItem: string) {
    console.log('jid', rosterItem);
    history.push(`/chat/${rosterItem}`);
  }

  async function handleRegister() {
    // const register = await registerService!.requestRegister();
    // rosterService!.setRosterItem('online');
    //console.log('register', register);
  }

  function renderRosterItem(rosterItem: RosterItem) {
    const displayName = rosterItem.name || rosterItem.jid.split('@')[0];

    return (
      <div key={rosterItem.jid}>
        <button
          onClick={() => handleClick(rosterItem.jid)}
          style={{ fontWeight: 'bold' }}
        >
          {displayName}
        </button>
        <span style={{ fontStyle: 'italic' }}>&nbsp;{rosterItem.jid}</span>
        <hr />
        <button onClick={() => handleRegister()}> Register</button>
      </div>
    );
  }

  function renderRoster(roster: RosterItem[]) {
    return roster.map((rosterItem: RosterItem) => renderRosterItem(rosterItem));
  }

  // if (!roster.length) return <Loading />;
  return (
    <>
      <h1>Chat List</h1>
      <input
        type="text"
        placeholder="enter jid"
        value={jid}
        onChange={(e: any) => {
          console.log('value', e.value);
          setJid(e.target.value);
        }}
      />
      <button
        onClick={() => {
          handleClick(jid);
        }}
      >
        chat
      </button>
      {renderRoster(roster)}
      {/* <div>{JSON.stringify(roster)}</div> */}
    </>
  );
};

ChatList.defaultProps = {};

export default ChatList;
