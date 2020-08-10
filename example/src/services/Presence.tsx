import Jid from '@xmpp-ts/jid';
import React, { FC, useState, useEffect } from 'react';
import { PresenceType } from '@xmpp-ts/presence';
import { RosterItem } from '@xmpp-ts/roster';
import { usePresenceService, useRoster } from 'xmpp-react-hooks';

export interface PresenceProps {}

const PresenceService: FC<PresenceProps> = (_props: PresenceProps) => {
  const [to, setTo] = useState<Jid>();
  const [type, setType] = useState<PresenceType>(PresenceType.SUBSCRIBE);
  const presenceService = usePresenceService();
  const roster = useRoster();

  useEffect(() => {
    if (!to && roster?.items?.[0]?.jid) setTo(roster.items[0].jid);
  }, [roster, to]);

  function handleSendPresence(
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) {
    e.preventDefault();
    if (to) {
      presenceService?.send({
        to,
        type
      });
    }
  }

  function renderRosterOptions() {
    return (roster?.items || []).map((rosterItem: RosterItem) => (
      <option key={rosterItem.jid.toString()} value={rosterItem.jid.toString()}>
        {rosterItem.name || rosterItem.jid.toString()}
      </option>
    ));
  }

  return (
    <div>
      <h1>Presence</h1>
      <hr />
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
            onChange={(e: any) =>
              setTo(
                e.target.value?.split('@')?.[1]
                  ? new Jid(
                      e.target.value.split('@')?.[0],
                      e.target.value.split('@')?.[1]
                    )
                  : undefined
              )
            }
            value={to?.toString()}
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

PresenceService.defaultProps = {};

export default PresenceService;
