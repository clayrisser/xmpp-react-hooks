import React, { FC, useState } from 'react';
import { useStatus, usePresenceService, PresenceType } from 'xmpp-react-hooks';
import Loading from '../components/Loading';

export interface PresenceProps {}

const Presence: FC<PresenceProps> = (_props: PresenceProps) => {
  const [to, setTo] = useState('');
  const [type, setType] = useState<PresenceType>(PresenceType.SUBSCRIBE);
  const presenceService = usePresenceService();
  const status = useStatus();

  function handleSendPresence(
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) {
    e.preventDefault();
    console.log('to', to);
    presenceService?.sendPresence({
      to,
      type
    });
  }

  if (!status.isReady) return <Loading />;
  return (
    <div>
      <h1>Presence</h1>
      <hr />
      <h3>Send Presence</h3>
      <form>
        <div style={{ paddingBottom: 10 }}>
          <label htmlFor="type">Type:</label>
          <br />
          <select
            name="type"
            id="type"
            onChange={(e: any) => setType(e.target.value)}
            value={type}
          >
            <option value="subscribe">Subscribe</option>
          </select>
        </div>
        <div style={{ paddingBottom: 10 }}>
          <label htmlFor="to">To:</label>
          <br />
          <input
            id="to"
            name="to"
            onChange={(e: any) => setTo(e.target.value)}
            value={to}
          />
        </div>
        <button type="submit" onClick={handleSendPresence}>
          Send Presence
        </button>
      </form>
    </div>
  );
};

Presence.defaultProps = {};

export default Presence;
