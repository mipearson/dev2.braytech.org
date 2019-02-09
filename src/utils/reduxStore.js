import { createStore, combineReducers } from 'redux';

import theme from './reducers/theme.js';
import member from './reducers/member.js';
import groupMembers from './reducers/groupMembers.js';
import refreshService from './reducers/refreshService.js';
import triumphs from './reducers/triumphs.js';
import collectibles from './reducers/collectibles.js';
// import milestones from './reducers/milestones.js';
import vendors from './reducers/vendors.js';
import viewport from './reducers/viewport.js';

const rootReducer = combineReducers({
  theme,
  member,
  groupMembers,
  refreshService,
  triumphs,
  collectibles,
  vendors,
  viewport
});

const store = createStore(
  rootReducer,
  window.__REDUX_DEVTOOLS_EXTENSION__ &&
    window.__REDUX_DEVTOOLS_EXTENSION__({
      actionsBlacklist: []
    })
);

export default store;
