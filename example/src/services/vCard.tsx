import React, { FC, useState } from 'react';
import { RosterItem } from '@xmpp-ts/roster';
import Jid from '@xmpp-ts/jid';
import {
  useVCard,
  useVCardService,
  useRoster,
  useXmppClient
} from 'xmpp-react-hooks';

export interface vCardProps {}

const VCard: FC<vCardProps> = (_props: vCardProps) => {
  const [avtar, setImage] = useState('');
  const [jid, setJid] = useState('');
  const vCard = useVCard(new Jid(jid));
  console.log('vCard', vCard);
  const roster = useRoster();
  const vCardService = useVCardService();
  const [value, setValue] = useState();
  const xmppClient = useXmppClient();

  async function handleSetVCard(
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) {
    e.preventDefault();
    await vCardService?.set({
      image: avtar
    });
  }

  async function handleGetVCard(
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) {
    e.preventDefault();
    const image = await vCardService?.get({});
    setValue(image);
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
      <h1>vCard</h1>
      <hr />
      <h3>Get vCard of Roster Items</h3>

      <select
        name="jid"
        id="jid"
        onChange={(e: any) => setJid(e.target.value)}
        value={jid}
      >
        <option
          selected={true}
          value={`${xmppClient?.jid?.local}@${xmppClient?.jid?.domain}`}
        >
          {`${xmppClient?.jid?.local}@${xmppClient?.jid?.domain}`}
        </option>
        {renderRosterOptions()}
      </select>
      {JSON.stringify(vCard)}
      <h3>Set vCard</h3>
      <input
        id="body"
        name="body"
        onChange={(e: any) => setImage(e.target.value)}
        value={avtar}
        style={{ width: 250 }}
      />

      <button onClick={(e: any) => handleSetVCard(e)}>Set vCard</button>
      <br />
      <br />
      <button onClick={(e: any) => handleGetVCard(e)}>Get vCard</button>
      {JSON.stringify(value)}
      <br />
      <br />
    </div>
  );
};

VCard.defaultProps = {};

export default VCard;
