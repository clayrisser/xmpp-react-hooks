import React, { FC, useState, useEffect } from 'react';
import { RosterItem } from '@xmpp-ts/roster';
import Jid from '@xmpp-ts/jid';
import { useMessageService, useMessages, useRoster } from 'xmpp-react-hooks';

export interface MessageProps {}

const Message: FC<MessageProps> = (_props: MessageProps) => {
  const [body, setBody] = useState('');
  const [jid, setJid] = useState('');
  const [to, setTo] = useState('');
  const messageService = useMessageService();
  const messages = useMessages(new Jid(jid), null);
  const roster = useRoster();

  useEffect(() => {
    if (!to && roster.items?.[0]?.jid) {
      setTo(roster.items[0].jid.bare().toString());
    }
    if (!jid && roster.items?.[0]?.jid) {
      setJid(roster.items[0].jid.bare().toString());
    }
  }, [roster, to, jid]);

  function handleSendMessage(
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) {
    e.preventDefault();
    messageService?.send({
      to: new Jid(to),
      body
    });
    setBody('');
  }

  function renderRosterOptions() {
    return roster.items?.map((rosterItem: RosterItem) => (
      <option
        key={rosterItem.jid.toString()}
        value={rosterItem.jid.bare().toString()}
      >
        {rosterItem.name || rosterItem.jid.bare().toString()}
      </option>
    ));
  }

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
