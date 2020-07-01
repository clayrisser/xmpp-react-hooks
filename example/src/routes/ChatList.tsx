import React, { FC, useState } from 'react';
import {
  useRoster,
  RosterItem,
  useRosterService,
  useStatus,
  useXmpp
} from 'xmpp-react-hooks';
import { useHistory } from 'react-router-dom';
import Loading from '../components/Loading';

export interface ChatListProps {}

const ChatList: FC<ChatListProps> = (_props: ChatListProps) => {
  const [jid, setJid] = useState('');
  const status = useStatus();
  const xmpp = useXmpp();
  console.log('status', status, 'xmpp', xmpp);
  const [name, setName] = useState<string>();
  const history = useHistory();
  const roster = useRoster();
  const rosterService = useRosterService();
  console.log('rosterService', rosterService);

  function handleRosterItemClick(rosterItem: string) {
    history.push(`/chat/${rosterItem}`);
  }

  async function handleSubmitJid(
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) {
    e.preventDefault();
    await rosterService?.setRosterItem(jid, name);
  }

  function renderRosterItem(rosterItem: RosterItem) {
    const displayName = rosterItem.name || rosterItem.jid.split('@')[0];
    return (
      <div key={rosterItem.jid}>
        <button
          onClick={() => handleRosterItemClick(rosterItem.jid)}
          style={{ fontWeight: 'bold' }}
        >
          {displayName}
        </button>
        <span style={{ fontStyle: 'italic' }}>&nbsp;{rosterItem.jid}</span>
        <hr />
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
      <form>
        <div style={{ paddingBottom: 10 }}>
          <label htmlFor="jid">Jid:</label>
          <br />
          <input
            id="jid"
            name="jid"
            onChange={(e: any) => setJid(e.target.value)}
            type="jid"
            value={jid}
          />
        </div>
        <div style={{ paddingBottom: 10 }}>
          <label htmlFor="jid">Name:</label>
          <br />
          <input
            id="name"
            name="name"
            onChange={(e: any) => setName(e.target.value)}
            type="name"
            value={name}
          />
        </div>
        <button type="submit" onClick={handleSubmitJid}>
          Register
        </button>
      </form>
      {renderRoster(roster)}
    </>
  );
};

ChatList.defaultProps = {};

export default ChatList;
