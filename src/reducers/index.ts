import { combineReducers } from 'redux';
import available from './available.js';
import messages from './messages.js';
import roster from './roster.js';
import vCard from './vCard.js';

export default combineReducers({ available, messages, roster, vCard });

export * from './available.js';
export * from './messages.js';
export * from './roster.js';
export * from './vCard.js';
