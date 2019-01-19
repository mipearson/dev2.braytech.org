// Bungie API access convenience methods
import { Globals } from './globals';

async function apiRequest(path) {
  const options = { headers: { 'X-API-Key': Globals.key.bungie } };

  const request = await fetch(`https://www.bungie.net${path}`, options).then(r => r.json());

  if (request.ErrorCode !== 1) {
    throw `Error retrieving ${path} from Bungie: (${request.ErrorStatus} code ${request.ErrorCode}) ${request.Message}`;
  }

  return request.Response;
}

export default {
  manifestIndex: async () => apiRequest('/Platform/Destiny2/Manifest/'),
  settings: async () => apiRequest(`/Platform/Settings`),
  milestones: async () => apiRequest('/Platform/Destiny2/Milestones'),
  manifest: async version => fetch(`https://www.bungie.net${version}`).then(a => a.json()),
  memberProfile: async (membershipType, membershipId) => apiRequest(`/Platform/Destiny2/${membershipType}/Profile/${membershipId}/?components=100,104,200,202,204,205,300,301,302,303,304,305,800,900`),
  memberGroups: async (membershipType, membershipId) => apiRequest(`/Platform/GroupV2/User/${membershipType}/${membershipId}/0/1/`)
};
