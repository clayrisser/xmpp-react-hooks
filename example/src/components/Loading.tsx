import { type FC } from 'react';

export interface LoadingProps {}

const Loading: FC<LoadingProps> = (_props: LoadingProps) => {
  return <div>loading . . .</div>;
};

export default Loading;
