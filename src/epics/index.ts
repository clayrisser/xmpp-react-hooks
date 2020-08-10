import { combineEpics } from 'redux-observable';
import available from './available';
import messages from './messages';
import roster from './roster';

export default combineEpics(...available, ...messages, ...roster);
