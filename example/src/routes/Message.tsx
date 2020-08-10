import React, { FC } from 'react';
import { Message as MessageService } from '../services';

export interface MessageProps {}

const Message: FC<MessageProps> = (_props: MessageProps) => {
  return <MessageService />;
};

Message.defaultProps = {};

export default Message;
