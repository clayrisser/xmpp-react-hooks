import { combineReducers } from 'redux';
import available from './available';
import roster from './roster';

export default combineReducers({ available, roster });
