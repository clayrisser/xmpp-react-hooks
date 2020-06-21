import React, { FC } from 'react';
import { Link } from 'react-router-dom';

export interface HeaderProps {}

const Header: FC<HeaderProps> = (_props: HeaderProps) => {
  return <Link to="/info">info</Link>;
};

Header.defaultProps = {};

export default Header;
