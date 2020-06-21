import React, { FC } from 'react';

export interface LoadingProps {}

const Loading: FC<LoadingProps> = (_props: LoadingProps) => {
  return <div>loading . . .</div>;
};

Loading.defaultProps = {};

export default Loading;
