import { type FC, type MouseEvent as ReactMouseEvent, useState, useEffect } from 'react';
import type { RosterItem } from '@xmpp-ts/roster';
import { Jid, useMessageService, useMessages, useRoster } from 'xmpp-react-hooks';

export interface MessageProps {}

const Message: FC<MessageProps> = (_props: MessageProps) => {
  const [body, setBody] = useState('');
  const [jid, setJid] = useState('');
  const [to, setTo] = useState('');
  const messageService = useMessageService();
  const messages = useMessages(new Jid(jid));
  const roster = useRoster();

  useEffect(() => {
    if (!to && roster.items?.[0]?.jid) {
      setTo(roster.items[0].jid.bare().toString());
    }
    if (!jid && roster.items?.[0]?.jid) {
      setJid(roster.items[0].jid.bare().toString());
    }
  }, [roster, to, jid]);

  function handleSendMessage(e: ReactMouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    messageService?.send({
      to: new Jid(to),
      body
    });
    setBody('');
  }

  function renderRosterOptions() {
    return roster.items?.map((rosterItem: RosterItem) => (
      <option key={rosterItem.jid.toString()} value={rosterItem.jid.bare().toString()}>
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
        <select name="jid" id="jid" onChange={(e: any) => setJid(e.target.value)} value={jid}>
          {renderRosterOptions()}
        </select>
      </div>
      <code>{JSON.stringify(messages)}</code>
      <h3>Send Message</h3>
      <form>
        <div style={{ paddingBottom: 10 }}>
          <label htmlFor="to">To: </label>
          <select name="to" id="to" onChange={(e: any) => setTo(e.target.value)} value={to}>
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

export default Message;
