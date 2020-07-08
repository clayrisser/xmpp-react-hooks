import React, { FC, useState } from 'react';
import { useRoster, useRosterService } from 'xmpp-react-hooks';

export interface RosterProps {}

const Roster: FC<RosterProps> = (_props: RosterProps) => {
  const [jid, setJid] = useState<string>('');
  const [name, setName] = useState<string>('');
  const modRoster = useRosterService();
  const roster = useRoster();

  async function handleSetRosterItem() {
    if (!jid) return;
    modRoster?.setRosterItem({ jid, name });
  }

  return (
    <div>
      <h1>Roster</h1>
      <hr />
      <code>{JSON.stringify(roster)}</code>
      <form>
        <div style={{ paddingBottom: 10 }}>
          <label htmlFor="jid">Jid:</label>
          <br />
        </div>
        <input
          id="jid"
          name="jid"
          onChange={(e: any) => setJid(e.target.value)}
          value={jid}
        />
        <input
          id="name"
          name="jid"
          onChange={(e: any) => setName(e.target.value)}
          value={name}
        />
        <button type="submit" onClick={handleSetRosterItem}>
          Set Roster Item
        </button>
      </form>
    </div>
  );
};

Roster.defaultProps = {};

export default Roster;
