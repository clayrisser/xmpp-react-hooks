import React, { FC, useState } from 'react';
import { useRoster, useRosterService } from 'xmpp-react-hooks';
export interface RosterProps {}

const Roster: FC<RosterProps> = (_props: RosterProps) => {
  const [jid, setJid] = useState<string>('');
  const [name, setName] = useState<string>('');
  const modRoster = useRosterService();
  const roster = useRoster();

  async function handleSetRosterItem(
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) {
    e.preventDefault();
    if (!jid) return;
    modRoster?.setRosterItem({ jid, name });
  }

  return (
    <div>
      <h1>Roster</h1>
      <hr />
      <h3>Use Roster</h3>
      <code>{JSON.stringify(roster)}</code>
      <h3>Set Roster Item</h3>
      <form>
        <div style={{ paddingBottom: 10 }}>
          <label htmlFor="jid">Jid:</label>
          <br />
          <input
            id="jid"
            name="jid"
            onChange={(e: any) => setJid(e.target.value)}
            value={jid}
          />
        </div>
        <div style={{ paddingBottom: 10 }}>
          <label htmlFor="name">Name:</label>
          <br />
          <input
            id="name"
            name="name"
            onChange={(e: any) => setName(e.target.value)}
            value={name}
          />
        </div>
        <button type="submit" onClick={handleSetRosterItem}>
          Set Roster Item
        </button>
      </form>
    </div>
  );
};

Roster.defaultProps = {};

export default Roster;
