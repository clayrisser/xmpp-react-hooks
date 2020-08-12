import Jid from '@xmpp-ts/jid';
import React, { FC, useState, useEffect } from 'react';
import { Roster, RosterItem } from '@xmpp-ts/roster';
import { useRosterService, useRoster } from 'xmpp-react-hooks';

export interface RosterProps {}

const RosterService: FC<RosterProps> = (_props: RosterProps) => {
  const [customJid, setCustomJid] = useState('');
  const [jid, setJid] = useState('');
  const [name, setName] = useState('');
  const [removeJid, setRemoveJid] = useState('');
  const roster = useRoster();
  console.log('useRoster', roster);
  const rosterService = useRosterService();
  const [getRosterState, setGetRosterState] = useState<Roster | undefined>(
    undefined
  );

  useEffect(() => {
    if (
      !removeJid ||
      !new Set([
        ...(roster?.items.map((rosterItem: RosterItem) =>
          rosterItem.jid.toString()
        ) || [])
      ]).has(removeJid)
    )
      setRemoveJid(roster?.items?.[0]?.jid.toString() || '');
  }, [roster]);

  async function handleSetRosterItem(
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) {
    e.preventDefault();
    await rosterService?.set({
      jid: jid || customJid,
      name
    });
  }

  async function handleGetRoster(
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) {
    e.preventDefault();
    const roster = await rosterService?.get();
    if (roster) setGetRosterState(roster);
  }

  async function handleRemoveRosterItem(
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) {
    e.preventDefault();
    if (!removeJid) return;
    await rosterService?.remove(
      new Jid(
        removeJid.split('@')?.[0],
        removeJid.split('@')?.[1]?.split('/')?.[0],
        removeJid.split('@')?.[1]?.split('/')?.[1]
      )
    );
  }

  function renderRosterOptions() {
    return roster?.items?.map((rosterItem: RosterItem) => (
      <option key={rosterItem.jid.toString()} value={rosterItem.jid.toString()}>
        {rosterItem.name || rosterItem.jid.toString()}
      </option>
    ));
  }

  function renderUseRoster() {
    return (
      <>
        <h3>Use Roster</h3>
        <div>{JSON.stringify(roster)}</div>
      </>
    );
  }

  function renderSetRosterItem() {
    return (
      <>
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
      </>
    );
  }

  function renderRemoveRosterItem() {
    return (
      <>
        <h3>Remove Roster Item</h3>
        <form>
          <div style={{ paddingBottom: 10 }}>
            <label htmlFor="removeJid">Jid: </label>
            <select
              name="removeJid"
              id="removeJid"
              onChange={(e: any) => setRemoveJid(e.target.value || '')}
              value={removeJid}
            >
              {renderRosterOptions()}
            </select>
          </div>
          <button type="submit" onClick={handleRemoveRosterItem}>
            Remove Roster Item
          </button>
        </form>
      </>
    );
  }

  function renderGetRoster() {
    return (
      <>
        <h3>Get Roster</h3>
        <code>{JSON.stringify(getRosterState)}</code>
        <button type="submit" onClick={handleGetRoster}>
          Get Roster
        </button>
      </>
    );
  }

  return (
    <div>
      <h1>Roster</h1>
      <hr />
      {renderUseRoster()}
      {renderGetRoster()}
      {renderSetRosterItem()}
      {renderRemoveRosterItem()}
    </div>
  );
};

RosterService.defaultProps = {};

export default RosterService;
