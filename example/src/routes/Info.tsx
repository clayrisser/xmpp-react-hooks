import React, { FC } from 'react';
import { useStatus } from 'xmpp-react-hooks';
import Loading from '../components/Loading';
import { Presence, Roster } from '../services';

export interface InfoProps {}

const Info: FC<InfoProps> = (_props: InfoProps) => {
  const status = useStatus();

  if (!status.isReady) return <Loading />;
  return (
    <>
      <Roster />
      <Presence />
    </>
  );
};

Info.defaultProps = {};

export default Info;
