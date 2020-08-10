import React, { FC, useEffect } from 'react';
import { useHistory } from 'react-router-dom';

export interface HomeProps {}

const Home: FC<HomeProps> = (_props: HomeProps) => {
  const history = useHistory();

  useEffect(() => {
    history.push('/login');
  }, []);

  return <div></div>;
};

Home.defaultProps = {};

export default Home;
