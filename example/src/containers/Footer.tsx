import React, { FC } from 'react';

export interface FooterProps {}

const Footer: FC<FooterProps> = (_props: FooterProps) => {
  return <div style={{ height: '400px' }} />;
};

Footer.defaultProps = {};

export default Footer;
