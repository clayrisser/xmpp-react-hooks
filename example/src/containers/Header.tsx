import React, { FC } from 'react';
import { Link } from 'react-router-dom';

export interface HeaderProps {}

const Header: FC<HeaderProps> = (_props: HeaderProps) => {
  return (
    <div style={{ display: 'flex' }}>
      <div style={{ padding: 10 }}>
        <Link to="/info">info</Link>
      </div>
      <div style={{ padding: 10 }}>
        <Link to="/roster">roster</Link>
      </div>
    </div>
  );
};

Header.defaultProps = {};

export default Header;
