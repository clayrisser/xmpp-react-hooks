import React, { FC } from 'react';
import { vCard as Card } from '../services';

export interface vCardProps {}

const vCard: FC<vCardProps> = (_props: vCardProps) => {
  return <Card />;
};

vCard.defaultProps = {};

export default vCard;
