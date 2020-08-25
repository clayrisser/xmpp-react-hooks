import { combineReducers } from 'redux';
import available from './available';
import messages from './messages';
import roster from './roster';
import vCard from './vCard';

export default combineReducers({ available, messages, roster, vCard });
