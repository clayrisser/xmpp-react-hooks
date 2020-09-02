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
  const [bDay, setBDay] = useState('');
  const [nickName, setNickName] = useState('');
  const [fullName, setFullName] = useState('');
  const [country, setCountry] = useState('');
  const [locality, setLocality] = useState('');
  const [pincode, setPincode] = useState();
  const [title, setTitle] = useState('');
  const [role, setRole] = useState('');
  const [number, setNumber] = useState('');
  const [id, setJabberId] = useState('');
  const [email, setEmail] = useState('');

  console.log('kjdds', xmppClient?.jid.bare().toString());

  async function handleSetVCard(
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) {
    e.preventDefault();
    await vCardService?.set({
      image: avtar,
      bday: bDay,
      country: country,
      locality: locality,
      email: email,
      nickName: nickName,
      jabberId: xmppClient?.jid.bare().toString(),
      fullName: fullName,
      number: number,
      title: title,
      role: role,
      pincode: pincode
    });
  }

  async function handleGetVCard(
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) {
    e.preventDefault();
    const result = await vCardService?.get({});
    setValue(result);
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
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <form style={{ width: 500 }}>
          <div>
            <label>Image:</label>
            <input
              id="image"
              name="image"
              onChange={(e: any) => setImage(e.target.value)}
              value={avtar}
              style={{ width: 250 }}
            />
          </div>
          <br />
          <div>
            <label>Birthday:</label>
            <input
              id="bday"
              name="bday"
              onChange={(e: any) => setBDay(e.target.value)}
              value={bDay}
              style={{ width: 250 }}
            />
          </div>
          <br />
          <div>
            <label>NickName:</label>
            <input
              id="nickName"
              name="nickName"
              onChange={(e: any) => setNickName(e.target.value)}
              value={nickName}
              style={{ width: 250 }}
            />
          </div>
          <br />
          <div>
            <label>FullName:</label>
            <input
              id="fulName"
              name="fullName"
              onChange={(e: any) => setFullName(e.target.value)}
              value={fullName}
              style={{ width: 250 }}
            />
          </div>
          <br />

          <div>
            <label>Locality:</label>
            <input
              id="locality"
              name="locality"
              onChange={(e: any) => setLocality(e.target.value)}
              value={locality}
              style={{ width: 250 }}
            />
          </div>
          <br />
          <div>
            <label>Country:</label>
            <input
              id="country"
              name="country"
              onChange={(e: any) => setCountry(e.target.value)}
              value={country}
              style={{ width: 250 }}
            />
          </div>
          <br />
          <div>
            <label>PinCode:</label>
            <input
              id="pincode"
              name="pincode"
              onChange={(e: any) => setPincode(e.target.value)}
              value={pincode}
              style={{ width: 250 }}
            />
          </div>
          <br />
          <div>
            <label>Title:</label>
            <input
              id="title"
              name="title"
              onChange={(e: any) => setTitle(e.target.value)}
              value={title}
              style={{ width: 250 }}
            />
          </div>
          <div>
            <label>Role:</label>
            <input
              id="role"
              name="role"
              onChange={(e: any) => setRole(e.target.value)}
              value={role}
              style={{ width: 250 }}
            />
          </div>
          <br />
          <div>
            <label>Email:</label>
            <input
              id="email"
              name="email"
              onChange={(e: any) => setEmail(e.target.value)}
              value={email}
              style={{ width: 250 }}
            />
          </div>
          <br />
          <div>
            <label>PhoneNumber:</label>
            <input
              id="number"
              name="number"
              onChange={(e: any) => setNumber(e.target.value)}
              value={number}
              style={{ width: 250 }}
            />
          </div>
          <br />
          {/* <div>
            <label>JabberId:</label>
            <input
              id="jabberid"
              name="jabberid"
              onChange={(e: any) => setJabberId(e.target.value)}
              value={email}
              style={{ width: 250 }}
            />
          </div> */}
          <br />
          <button onClick={(e: any) => handleSetVCard(e)}>Set vCard</button>
        </form>
      </div>

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
