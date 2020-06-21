import React, { FC } from 'react';
import { useRoster, RosterItem } from 'xmpp-react-hooks';
import { useHistory } from 'react-router-dom';
import Loading from '../components/Loading';

export interface ChatListProps {}

const ChatList: FC<ChatListProps> = (_props: ChatListProps) => {
  const history = useHistory();
  const roster = useRoster();

  function handleClick(rosterItem: string) {
    history.push(`/chat/${rosterItem}`);
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
      </div>
    );
  }

  function renderRoster(roster: RosterItem[]) {
    return roster.map((rosterItem: RosterItem) => renderRosterItem(rosterItem));
  }

  if (!roster.length) return <Loading />;
  return (
    <>
      <h1>Chat List</h1>
      {renderRoster(roster)}
    </>
  );
};

ChatList.defaultProps = {};

export default ChatList;
