import React, { FC, useState, useEffect } from 'react';
import { RosterItem, useRoster, useRosterService } from 'xmpp-react-hooks';

export interface RosterProps {}

const Roster: FC<RosterProps> = (_props: RosterProps) => {
  const [customJid, setCustomJid] = useState('');
  const [jid, setJid] = useState('');
  const [name, setName] = useState('');
  const [removeJid, setRemoveJid] = useState('');
  const roster = useRoster();
  const rosterService = useRosterService();

  useEffect(() => {
    if (!removeJid && roster?.[0]?.jid) setRemoveJid(roster[0].jid);
  }, [roster, removeJid]);

  async function handleSetRosterItem(
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) {
    e.preventDefault();
    if (!jid && !customJid) return;
    rosterService?.setRosterItem({ jid: jid || customJid, name });
    setCustomJid('');
    setName('');
  }

  async function handleRemoveRosterItem(
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) {
    e.preventDefault();
    if (!removeJid) return;
    rosterService?.removeRosterItem({ jid: removeJid });
    setRemoveJid(roster?.[0].jid || '');
  }

  function renderRosterOptions() {
    return roster?.map((rosterItem: RosterItem) => (
      <option key={rosterItem.jid} value={rosterItem.jid}>
        {rosterItem.name || rosterItem.jid}
      </option>
    ));
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
          <label htmlFor="jid">Jid: </label>
          <select
            name="jid"
            id="jid"
            onChange={(e: any) => setJid(e.target.value)}
            value={jid}
          >
            <option value={''}>Custom</option>
            {renderRosterOptions()}
          </select>
          {jid ? null : (
            <input
              style={{ marginLeft: 10 }}
              name="customJid"
              id="customJid"
              onChange={(e: any) => setCustomJid(e.target.value)}
              value={customJid}
            />
          )}
        </div>
        <div style={{ paddingBottom: 10 }}>
          <label htmlFor="name">Name: </label>
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
      <h3>Remove Roster Item</h3>
      <form>
        <div style={{ paddingBottom: 10 }}>
          <label htmlFor="removeJid">Jid: </label>
          <select
            name="removeJid"
            id="removeJid"
            onChange={(e: any) => setRemoveJid(e.target.value)}
            value={removeJid}
          >
            {renderRosterOptions()}
          </select>
        </div>
        <button type="submit" onClick={handleRemoveRosterItem}>
          Remove Roster Item
        </button>
      </form>
    </div>
  );
};

Roster.defaultProps = {};

export default Roster;
