import { combineEpics } from 'redux-observable';
import available from './available';
import roster from './roster';

export default combineEpics(...available, ...roster);
