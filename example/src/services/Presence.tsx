import React, { FC, useState, useEffect } from 'react';
import {
  PresenceType,
  RosterItem,
  useAvailable,
  usePresenceService,
  useRoster,
  useStatus
} from 'xmpp-react-hooks';
import Loading from '../components/Loading';

export interface PresenceProps {}

const Presence: FC<PresenceProps> = (_props: PresenceProps) => {
  const [to, setTo] = useState('');
  const [type, setType] = useState<PresenceType>(PresenceType.SUBSCRIBE);
  const available = useAvailable();
  const presenceService = usePresenceService();
  const roster = useRoster();
  const status = useStatus();

  useEffect(() => {
    /* if (!to && roster?.[0]?.jid) setTo(roster[0].jid); */
  }, [roster, to]);

  function handleSendPresence(
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) {
    e.preventDefault();
    presenceService?.sendPresence({
      to,
      type
    });
  }

  function handleSendUnavailable() {
    presenceService?.sendUnavailable();
  }

  function handleSendAvailable() {
    presenceService?.sendAvailable();
  }

  function renderRosterOptions() {
    return [].map((rosterItem: RosterItem) => (
      <option key={rosterItem.jid} value={rosterItem.jid}>
        {rosterItem.name || rosterItem.jid}
      </option>
    ));
  }

  if (!status.isReady) return <Loading />;
  return (
    <div>
      <h1>Presence</h1>
      <hr />
      <h3>Available</h3>
      <code>{JSON.stringify(available)}</code>
      <h3>Send Unavailable</h3>
      <button onClick={handleSendUnavailable}>Send Unavailable</button>
      <h3>Send Available</h3>
      <button onClick={handleSendAvailable}>Send Available</button>
      <h3>Send Presence</h3>
      <form>
        <div style={{ paddingBottom: 10 }}>
          <label htmlFor="type">Type: </label>
          <select
            name="type"
            id="type"
            onChange={(e: any) => setType(e.target.value)}
            value={type}
          >
            <option value={PresenceType.SUBSCRIBE}>Subscribe</option>
            <option value={PresenceType.UNSUBSCRIBE}>Unsubscribe</option>
          </select>
        </div>
        <div style={{ paddingBottom: 10 }}>
          <label htmlFor="to">To: </label>
          <select
            name="to"
            id="to"
            onChange={(e: any) => setTo(e.target.value)}
            value={to}
          >
            {renderRosterOptions()}
          </select>
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
