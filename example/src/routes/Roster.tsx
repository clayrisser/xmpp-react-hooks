import React, { FC } from 'react';
import { useStatus } from 'xmpp-react-hooks';
import Loading from '../components/Loading';
import { Roster as RosterService } from '../services';

export interface RosterProps {}

const Roster: FC<RosterProps> = (_props: RosterProps) => {
  const status = useStatus();
  if (!status.isReady) return <Loading />;
  return <RosterService />;
};

Roster.defaultProps = {};

export default Roster;
