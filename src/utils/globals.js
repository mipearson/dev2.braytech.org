export const Globals = {
  key: {
    braytech: process.env.REACT_APP_BRAYTECH_API_KEY,
    bungie: process.env.REACT_APP_BUNGIE_API_KEY
  },
  url: {
    braytech: 'https://api.braytech.org',
    bungie: 'https://www.bungie.net'
  },
  routes: {
    standard: ['character-select', 'pride', 'credits', 'settings', 'resources', 'read', 'inspect'],
    badboys: ['vendors']
  }
};

export const isProfileRoute = (pathname, hasProfileData = false) => {
  let paths = pathname.split('/');
  // if (paths[1] === 'collections' && paths[2] === 'inspect') {
  //   return false;
  // } else
  console.log(paths[4])
  if (pathname !== '/' && !Globals.routes.standard.includes(paths[4]) && !Globals.routes.badboys.includes(paths[4])) {
    return true;
  } else if (Globals.routes.badboys.includes(paths[4]) && hasProfileData) {
    return true;
  } else {
    return false;
  }
};

export const themeOverride = pathname => {
  let paths = pathname.split('/');
  if (['read', 'inspect'].includes(paths[4])) {
    return 'dark-mode ' + paths[4];
  } else {
    return false;
  }
};

export default Globals;
