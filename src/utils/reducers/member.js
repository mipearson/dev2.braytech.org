import * as ls from '../localStorage';
import store from '../reduxStore';
import getMember from '../getMember';

const savedProfile = ls.get('setting.profile');
const defaultState = {
  membershipType: savedProfile && savedProfile.membershipType,
  membershipId: savedProfile && savedProfile.membershipId,
  characterId: savedProfile && savedProfile.characterId,
  data: false,
  prevData: false,
  loading: false,
  error: false
};

async function loadMember(membershipType, membershipId) {
  // Note: while calling store.dispatch from within a reducer is an anti-pattern,
  // calling one asynchronously (eg as a result of a fetch) is just fine.
  try {
    const data = await getMember(membershipType, membershipId);

    if (!data.profile.characterProgressions.data) {
      store.dispatch({ type: 'MEMBER_LOAD_ERROR', payload: { membershipId, membershipType, error: new Error('private') } });
      return;
    }

    store.dispatch({ type: 'MEMBER_LOADED', payload: { membershipId, membershipType, data } });
  } catch (error) {
    store.dispatch({ type: 'MEMBER_LOAD_ERROR', payload: { membershipId, membershipType, error } });
    return;
  }
}

export default function memberReducer(state = defaultState, action) {
  if (!action.payload) return state;
  const { membershipType, membershipId, characterId, data, error } = action.payload;

  if (action.type === 'MEMBER_LOAD_NEW_MEMBERSHIP') {
    loadMember(membershipType, membershipId);
    return {
      ...state,
      membershipId,
      membershipType,
      characterId: null,
      data: false,
      error: false,
      loading: true
    };
  }

  if (!membershipType === state.membershipType && membershipId === state.membershipId) {
    // We send the membership type & membership ID along with all member
    // dispatches to make sure that multiple async actions on different members
    // don't stomp on each other - eg a user searches for one member, clicks it, then
    // searches for another and clicks it before the first is finished loading.

    return state;
  }

  switch (action.type) {
    case 'MEMBER_CHARACTER_SELECT':
      return {
        ...state,
        characterId
      };
    case 'MEMBER_LOAD_ERROR':
      return {
        ...state,
        loading: false,
        error
      };
    case 'MEMBER_LOADED':
      if (state.prevData !== data) {
        data.updated = new Date().getTime();
      }
      // console.log(state.characterId, data.profile.characters.data[0].characterId);
      return {
        ...state,
        characterId: state.characterId ? state.characterId : data.profile.characters.data[0].characterId,
        data: data,
        prevData: state.data,
        loading: false,
        error: false
      };
    default:
      return state;
  }
}
