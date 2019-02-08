import * as ls from '../localStorage';

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

export default function memberReducer(state = defaultState, action) {
  switch (action.type) {
    case 'MEMBER_CHARACTER_SELECT':
      return {
        ...state,
        characterId: action.payload
      };
    case 'MEMBER_LOADING_NEW_MEMBERSHIP':
      const reset = action.payload.membershipId !== state.membershipId || action.payload.membershipType !== state.membershipType;
      return {
        ...state,
        membershipId: action.payload.membershipId,
        membershipType: action.payload.membershipType,
        characterId: action.payload.characterId,
        data: reset ? false : state.data,
        error: false,
        loading: true
      };
    case 'MEMBER_LOAD_ERROR':
      return {
        ...state,
        loading: false,
        error: action.payload
      };
    case 'MEMBER_LOADED':
      if (state.prevData !== action.payload) {
        action.payload.updated = new Date().getTime();
      }
      return {
        ...state,
        data: action.payload,
        prevData: state.data,
        loading: false,
        error: false
      };
    default:
      return state;
  }
}
