import React, { FC, useState, useEffect } from 'react';
import {
  useMessageService,
  useStatus,
  useMessages,
  useRoster,
  RosterItem
} from 'xmpp-react-hooks';
import Loading from '../components/Loading';

export interface MessageProps {}

const Message: FC<MessageProps> = (_props: MessageProps) => {
  const [body, setBody] = useState('');
  const [jid, setJid] = useState('');
  const [to, setTo] = useState('');
  const messageService = useMessageService();
  const messages = useMessages(jid);
  const roster = useRoster();
  const status = useStatus();

  useEffect(() => {
    if (!to && roster?.[0]?.jid) setTo(roster[0].jid);
    if (!jid && roster?.[0]?.jid) setJid(roster[0].jid);
  }, [roster, to, jid]);

  function handleSendMessage(
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) {
    e.preventDefault();
    messageService?.sendMessage({
      to,
      body
    });
    setBody('');
    setTo('');
  }

  function renderRosterOptions() {
    return roster?.map((rosterItem: RosterItem) => (
      <option key={rosterItem.jid} value={rosterItem.jid}>
        {rosterItem.name || rosterItem.jid}
      </option>
    ));
  }

  if (!status.isReady) return <Loading />;
  return (
    <div>
      <h1>Message</h1>
      <hr />
      <h3>Messages</h3>
      <div style={{ paddingBottom: 10 }}>
        <label htmlFor="jid">Jid: </label>
        <select
          name="jid"
          id="jid"
          onChange={(e: any) => setJid(e.target.value)}
          value={jid}
        >
          {renderRosterOptions()}
        </select>
      </div>
      <code>{JSON.stringify(messages)}</code>
      <h3>Send Message</h3>
      <form>
        <div style={{ paddingBottom: 10 }}>
          <label htmlFor="to">To: </label>
          <select
            name="to"
            id="to"
            onChange={(e: any) => setTo(e.target.value)}
            value={to}
          >
            {renderRosterOptions()}
          </select>
        </div>
        <div style={{ paddingBottom: 10 }}>
          <label htmlFor="body">Body:</label>
          <br />
          <textarea
            id="body"
            name="body"
            onChange={(e: any) => setBody(e.target.value)}
            value={body}
          />
        </div>
        <button type="submit" onClick={handleSendMessage}>
          Send Message
        </button>
      </form>
    </div>
  );
};

Message.defaultProps = {};

export default Message;
