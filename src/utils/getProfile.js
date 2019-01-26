import assign from 'lodash/assign';
import Globals from './globals';

import store from './reduxStore';
import * as responseUtils from './responseUtils';

async function apiRequest(membershipType, membershipId) {
  let requests = [
    {
      name: 'profile',
      path: `https://www.bungie.net/Platform/Destiny2/${membershipType}/Profile/${membershipId}/?components=100,104,200,202,204,205,300,301,302,303,304,305,800,900`
    },
    {
      name: 'milestones',
      path: `https://www.bungie.net/Platform/Destiny2/Milestones/`
    },
    {
      name: 'groups',
      path: `https://www.bungie.net/Platform/GroupV2/User/${membershipType}/${membershipId}/0/1/`
    }
  ];

  let fetches = requests.map(async request => {
    const get = await fetch(request.path, {
      headers: {
        'X-API-Key': Globals.key.bungie
      }
    });
    const response = await get.json();
    let object = {};
    object[request.name] = response;
    return object;
  });

  try {
    const promises = await Promise.all(fetches);
    return assign(...promises);
  } catch (error) {
    console.log(error);
  }
}

async function getProfile(membershipType, membershipId, characterId = false, stateCallback) {
  const state = store.getState();

  // console.log('getProfile', state);

  stateCallback({
    data: state.profile.data,
    characterId: characterId,
    loading: true,
    error: false
  });

  let data = await apiRequest(membershipType, membershipId);

  if (!data) {
    stateCallback({
      data: state.profile.data,
      characterId: characterId,
      loading: false,
      error: 'fetch'
    });
    return;
  }

  if (data.profile.ErrorCode !== 1) {
    stateCallback({
      data: state.profile.data,
      characterId: characterId,
      loading: false,
      error: data.profile.ErrorCode
    });
    return;
  }

  if (!data.profile.Response.characterProgressions.data) {
    stateCallback({
      data: state.profile.data,
      characterId: characterId,
      loading: false,
      error: 'privacy'
    });
    return;
  }

  data = responseUtils.profileScrubber(data);
  data = responseUtils.groupScrubber(data);

  stateCallback({
    data: data,
    characterId: characterId,
    loading: false,
    error: false
  });
}

export default getProfile;
