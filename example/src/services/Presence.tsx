import React, { FC, useState } from 'react';
import { useStatus, usePresenceService } from 'xmpp-react-hooks';
import Loading from '../components/Loading';

export interface PresenceProps {}

const Presence: FC<PresenceProps> = (_props: PresenceProps) => {
  const [withJid, setWithJid] = useState<string>();
  const modPresence = usePresenceService();
  const status = useStatus();

  async function handleGetPreference() {
    modPresence?.sendPresence({ to: withJid });
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
          id="withJid"
          name="withJid"
          onChange={(e: any) => setWithJid(e.target.value)}
          value={withJid}
        />
        <button type="submit" onClick={handleGetPreference}>
          Get Presence
        </button>
      </form>
    </div>
  );
};

Presence.defaultProps = {};

export default Presence;
