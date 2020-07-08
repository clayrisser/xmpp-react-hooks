import React, { FC, useState } from 'react';
import {
  useStatus,
  useRoster,
  RosterItem,
  useRosterService
} from 'xmpp-react-hooks';
import Loading from '../components/Loading';

export interface RosterProps {}

const Roster: FC<RosterProps> = (_props: RosterProps) => {
  //   const [mamMessages, setMamMessages] = useState<MamMessage[]>([]);
  const [jid, setJid] = useState<string>('');
  const [name, setName] = useState<string>('');
  const modRoster = useRosterService();
  const roster = useRoster();
  //   const mamService = useMamService();
  const status = useStatus();

  //   async function handleGetMamMessages(
  //     e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  //   ) {
  //     e.preventDefault();
  //     const mamMessages = (await mamService?.getMessages(withJid)) || [];
  //     setMamMessages(mamMessages);
  //   }

  async function handleSetRosterItem() {
    if (!jid) return;
    modRoster?.setRosterItem({ jid, name });
  }

  if (!status.isReady) return <Loading />;
  return (
    <div>
      <h1>Presence</h1>
      <hr />
      <h3></h3>
      <form>
        <div style={{ paddingBottom: 10 }}>
          <label htmlFor="withJid">WithJid:</label>
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
          Set Roster Items
        </button>

        <p>Roster Items:</p>
        <br />
        <p>{JSON.stringify(roster)}</p>
      </form>
    </div>
  );
};

Roster.defaultProps = {};

export default Roster;
