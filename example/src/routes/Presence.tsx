import React, { FC } from 'react';
import { Presence as PresenceService } from '../services';

export interface PresenceProps {}

const Presence: FC<PresenceProps> = (_props: PresenceProps) => {
  return <PresenceService />;
};

Presence.defaultProps = {};

export default Presence;
