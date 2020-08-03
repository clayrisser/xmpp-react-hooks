import { combineEpics } from 'redux-observable';
import roster from './roster';

export default combineEpics(...roster);
