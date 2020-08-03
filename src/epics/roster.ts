import { ActionsObservable, ofType } from 'redux-observable';
import { Observable, Observer } from 'rxjs';
import { RosterItem } from '@xmpp-ts/roster';
import { mergeMap, map } from 'rxjs/operators';
import { Action } from '../types';
import { RosterActions } from '../reducers/roster';

export const addRosterItem = (rosterItem: RosterItem): Action<RosterItem> => ({
  payload: rosterItem,
  type: RosterActions.AddRosterItem
});

export function addRosterItemEpic(
  action$: ActionsObservable<Action<RosterItem>>
) {
  return action$.pipe(
    ofType(RosterActions.AddRosterItem),
    mergeMap(({ payload }: Action<RosterItem>) => {
      return new Observable(({ next, complete }: Observer<RosterItem>) => {
        next(payload);
        complete();
      }).pipe(map((rosterItem: RosterItem) => addRosterItem(rosterItem)));
    })
  );
}

export default [addRosterItemEpic];
