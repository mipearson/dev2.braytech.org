import store from './reduxStore';
import * as responseUtils from './responseUtils';

import * as bungie from './bungie';

async function getProfile() {
  const { membershipType, membershipId } = store.getState().profile;

  store.dispatch({ type: 'PROFILE_LOADING' });

  let profile,
    milestones,
    groups = false;

  try {
    // prettier-ignore
    [profile, milestones, groups] = await Promise.all([
      bungie.memberProfile(membershipType, membershipId, '100,104,200,202,204,205,300,301,302,303,304,305,800,900'),
      bungie.milestones(),
      bungie.memberGroups(membershipType, membershipId)
    ]);
  } catch (error) {
    store.dispatch({ type: 'PROFILE_LOAD_ERROR', payload: `${error}` });
    return;
  }

  if (!profile.characterProgressions.data) {
    store.dispatch({ type: 'PROFILE_LOAD_ERROR', payload: 'private' });
    return;
  }

  profile = responseUtils.profileScrubber(profile);
  groups = responseUtils.groupScrubber(groups);

  store.dispatch({
    type: 'PROFILE_LOADED',
    payload: {
      profile,
      groups,
      milestones
    }
  });
}

export default getProfile;
