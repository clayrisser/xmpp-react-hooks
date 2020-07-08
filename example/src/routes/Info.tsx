import React, { FC } from 'react';
import { useStatus } from 'xmpp-react-hooks';
import Loading from '../components/Loading';
import { Roster } from '../services';

export interface InfoProps {}

const Info: FC<InfoProps> = (_props: InfoProps) => {
  const status = useStatus();

  if (!status.isReady) return <Loading />;
  return (
    <>
      <Roster />
    </>
  );
};

Info.defaultProps = {};

export default Info;
