import React, { FC, useState, useEffect } from 'react';
import { RosterItem } from '@xmpp-ts/roster';
import Jid from '@xmpp-ts/jid';
import { usevCard } from 'xmpp-react-hooks';

export interface vCardProps {}

const VCard: FC<vCardProps> = (_props: vCardProps) => {
  const [avtar, setImage] = useState('');
  const vCard = usevCard();
  const [value, setValue] = useState('');
  console.log('vCard', vCard);

  async function handleGetVCard(
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) {
    e.preventDefault();
    await vCard?.set({
      image: avtar
      // https://www.microsoft.com/en-us/research/wp-content/uploads/2017/05/avatar_user__1495496383.jpg
      // '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',
    });
  }

  async function getVCard(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    e.preventDefault();
    const img = await vCard?.get({});
    setValue(img.ext_val);
    console.log('value', value);
  }

  return (
    <div>
      <h1>VCard</h1>
      <hr />
      <h3>VCardTest</h3>
      <input
        id="body"
        name="body"
        onChange={(e: any) => setImage(e.target.value)}
        value={avtar}
        style={{ width: 250 }}
      />
      <button onClick={(e: any) => handleGetVCard(e)}>Set VCard</button>
      <br />
      <br />
      <button onClick={(e: any) => getVCard(e)}>Get VCard</button>
      <img src={value} style={{ width: 100, height: 100 }} />
    </div>
  );
};

VCard.defaultProps = {};

export default VCard;
