import React, { FC } from 'react';
import { Roster as RosterService } from '../services';

export interface RosterProps {}

const Roster: FC<RosterProps> = (_props: RosterProps) => {
  return <RosterService />;
};

Roster.defaultProps = {};

export default Roster;
