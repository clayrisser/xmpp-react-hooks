import React, { FC } from 'react';
import { useStatus } from 'xmpp-react-hooks';
import Loading from '../components/Loading';
import { Presence as PresenceService } from '../services';

export interface PresenceProps {}

const Presence: FC<PresenceProps> = (_props: PresenceProps) => {
  const status = useStatus();
  if (!status.isReady) return <Loading />;
  return <PresenceService />;
};

Presence.defaultProps = {};

export default Presence;
