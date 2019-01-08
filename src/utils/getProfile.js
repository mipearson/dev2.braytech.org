import assign from 'lodash/assign';
import Globals from './globals';

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

export async function getProfile(membershipType, membershipId) {
  let data = await apiRequest(membershipType, membershipId);

  if (data.profile.ErrorCode !== 1) {
    throw `Error code ${data.profile.ErrorCode}`;
  }

  if (!data.profile.Response.characterProgressions.data) {
    throw `Profile is private`;
  }

  return responseUtils.profileScrubber(data);
}
