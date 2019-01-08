import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Redirect, Switch } from 'react-router-dom';
import cx from 'classnames';
import assign from 'lodash/assign';
import packageJSON from '../package.json';
import { withNamespaces } from 'react-i18next';

import './utils/i18n';

import './Core.css';
import './App.css';

import init from './utils/init';

import { Globals, isProfileRoute } from './utils/globals';
import dexie from './utils/dexie';
import * as ls from './utils/localStorage';
import GoogleAnalytics from './components/GoogleAnalytics';
import { getProfile } from './utils/getProfile';

import Loading from './components/Loading';
import Header from './components/Header';
import Tooltip from './components/Tooltip';
import Footer from './components/Footer';
import Notifications from './components/Notifications';

import Index from './views/Index';
import CharacterSelect from './views/CharacterSelect';
import Clan from './views/Clan';
import Collections from './views/Collections';
import Triumphs from './views/Triumphs';
import Checklists from './views/Checklists';
import Account from './views/Account';
import Character from './views/Character';
import ThisWeek from './views/ThisWeek';
import Vendors from './views/Vendors';
import Settings from './views/Settings';
import Pride from './views/Pride';
import Credits from './views/Credits';
import Tools from './views/Tools';
import ClanBannerBuilder from './views/Tools/ClanBannerBuilder';

import BraytechContext from './BraytechContext';

class App extends Component {
  constructor(props) {
    super();

    let user = ls.get('setting.user') ? ls.get('setting.user') : false;
    let theme = ls.get('setting.theme') ? ls.get('setting.theme') : 'light-mode';

    this.state = {
      status: {
        code: false,
        detail: false
      },
      user: {
        membershipType: user ? user.membershipType : false,
        membershipId: user ? user.membershipId : false,
        characterId: user ? user.characterId : false,
        data: false
      },
      manifest: {
        version: false,
        settings: false
      },
      theme: {
        selected: theme,
        setFn: this.setTheme
      }
    };

    this.manifest = {};
    this.bungieSettings = {};
    this.currentLanguage = props.i18n.getCurrentLanguage();
  }

  setTheme = theme => {
    this.setState(state => ({
      theme: { ...state.theme, selected: theme }
    }));
    ls.set('setting.theme', theme);
  };

  updateViewport = () => {
    let width = window.innerWidth;
    let height = window.innerHeight;
    this.setState({
      viewport: {
        width,
        height
      }
    });
  };

  setProfile = (membershipType, membershipId, characterId, data, setAsDefaultProfile = false) => {
    if (setAsDefaultProfile) {
      ls.set('setting.user', {
        membershipType: membershipType,
        membershipId: membershipId,
        characterId: characterId
      });
    }
    this.setState({
      user: {
        membershipType: membershipType,
        membershipId: membershipId,
        characterId: characterId,
        data: data
      }
    });
  };

  viewCharacters = () => {
    let state = this.state;
    state.user.characterId = false;
    this.setState(state);
  };

  getVersionAndSettings = () => {
    let state = this.state;
    state.status.code = 'checkManifest';
    this.setState(state);

    const paths = [
      {
        name: 'manifest',
        url: 'https://www.bungie.net/Platform/Destiny2/Manifest/'
      },
      {
        name: 'settings',
        url: 'https://www.bungie.net/Platform/Settings/'
      }
    ];

    let requests = paths.map(path => {
      return fetch(path.url, {
        headers: {
          'X-API-Key': Globals.key.bungie
        }
      })
        .then(response => {
          return response.json();
        })
        .then(response => {
          if (response.ErrorCode === 1) {
            let object = {};
            object[path.name] = response.Response;
            return object;
          }
        });
    });

    return Promise.all(requests)
      .then(responses => {
        const response = assign(...responses);

        this.bungieSettings = response.settings;

        let availableLanguages = [];
        for (var i in response.manifest.jsonWorldContentPaths) {
          availableLanguages.push(i);
        }

        this.availableLanguages = availableLanguages;

        return response.manifest.jsonWorldContentPaths[this.currentLanguage];
      })
      .catch(error => {
        return error;
      });
  };

  getManifest = version => {
    let state = this.state;
    state.status.code = 'fetchManifest';
    state.manifest.version = version;
    this.setState(state);

    let manifest = async () => {
      const request = await fetch(`https://www.bungie.net${version}`);
      const response = await request.json();
      return response;
    };

    manifest()
      .then(manifest => {
        let state = this.state;
        state.status.code = 'setManifest';
        this.setState(state);
        dexie
          .table('manifest')
          .clear()
          .then(() => {
            dexie.table('manifest').add({
              version: version,
              value: manifest
            });
          })
          .then(() => {
            dexie
              .table('manifest')
              .toArray()
              .then(manifest => {
                this.manifest = manifest[0].value;
                this.manifest.settings = this.bungieSettings;
              });
          });
      })
      .catch(error => {
        console.log(error);
      });
  };

  componentDidMount() {
    this.updateViewport();
    window.addEventListener('resize', this.updateViewport);

    const promises = [
      dexie
        .table('manifest')
        .toArray()
        .then(manifest => {
          if (manifest.length > 0) {
            let state = this.state;
            state.manifest.version = manifest[0].version;
            this.setState(state);
          }
        })
        .then(() =>
          this.getVersionAndSettings().then(version => {
            if (version !== this.state.manifest.version) {
              this.getManifest(version);
            } else {
              dexie
                .table('manifest')
                .toArray()
                .then(manifest => {
                  if (manifest.length > 0) {
                    this.manifest = manifest[0].value;
                    this.manifest.settings = this.bungieSettings;
                  } else {
                    throw 'Failure to access IndexedDB manifest';
                  }
                });
            }
          })
        )
    ];

    if (this.state.user.membershipId && this.state.user.membershipType) {
      // User has a saved membership, pre-emptively load it
      promises.push(
        new Promise(resolve => {
          getProfile(this.state.user.membershipType, this.state.user.membershipId)
            .then(data => {
              const state = this.state;
              state.user.data = data;
              this.setState(state);
              resolve();
            })
            .catch(error => {
              // Don't care if we can't load the profile at this stage,
              // worry about it later.
              console.log(error);
              resolve();
            });
        })
      );
    }

    Promise.all(promises)
      .then(() => {
        const state = this.state;
        state.status.code = 'ready';
        this.setState(state);
      })
      .catch(error => {
        let state = this.state;
        state.status.code = 'error';
        state.status.detail = error;
        this.setState(state);
      });
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateViewport);
  }

  render() {
    const { t } = this.props;
    if (!window.ga) {
      GoogleAnalytics.init();
    }

    if (this.state.status.code !== 'ready') {
      return <Loading state={this.state.status} theme={this.state.theme.selected} />;
    } else {
      if (this.state.user.data && this.state.user.characterId) {
        return (
          <BraytechContext.Provider value={this.state.theme}>
            <Router>
              <Route
                render={route => (
                  <div className={cx('wrapper', this.state.theme.selected, { 'profile-route': isProfileRoute(route.location.pathname) })}>
                    <Route path='/' render={route => <Notifications updateAvailable={this.props.updateAvailable} />} />
                    <GoogleAnalytics.RouteTracker />
                    <div className='main'>
                      <Route path='/' render={route => <Header route={route} {...this.state} manifest={this.manifest} />} />
                      <Switch>
                        <Route path='/character-select' render={route => <CharacterSelect getProfile={getProfile} setProfile={this.setProfile} location={route.location} user={this.state.user} viewport={this.state.viewport} manifest={this.manifest} />} />
                        <Route
                          path='/account'
                          exact
                          render={() => (
                            <>
                              <Account {...this.state.user} manifest={this.manifest} />
                              <Tooltip manifest={this.manifest} />
                            </>
                          )}
                        />
                        <Route path='/clan/:view?/:subView?' exact render={route => <Clan {...this.state.user} manifest={this.manifest} view={route.match.params.view} subView={route.match.params.subView} />} />
                        <Route path='/character' exact render={() => <Character {...this.state.user} viewport={this.state.viewport} manifest={this.manifest} />} />
                        <Route path='/checklists' exact render={() => <Checklists {...this.state.user} viewport={this.state.viewport} manifest={this.manifest} />} />
                        <Route
                          path='/collections/:primary?/:secondary?/:tertiary?/:quaternary?'
                          render={route => (
                            <>
                              <Collections {...route} {...this.state.user} manifest={this.manifest} />
                              <Tooltip manifest={this.manifest} />
                            </>
                          )}
                        />
                        <Route path='/triumphs/:primary?/:secondary?/:tertiary?/:quaternary?' render={route => <Triumphs {...route} {...this.state.user} manifest={this.manifest} />} />
                        <Route
                          path='/this-week'
                          exact
                          render={() => (
                            <>
                              <ThisWeek {...this.state.user} manifest={this.manifest} />
                              <Tooltip manifest={this.manifest} />
                            </>
                          )}
                        />
                        <Route path='/vendors/:hash?' exact render={route => <Vendors vendorHash={route.match.params.hash} {...this.state.user} manifest={this.manifest} />} />
                        <Route path='/settings' exact render={() => <Settings {...this.state.user} manifest={this.manifest} availableLanguages={this.availableLanguages} />} />
                        <Route path='/pride' exact render={() => <Pride />} />
                        <Route path='/credits' exact render={() => <Credits />} />
                        <Route path='/tools' exact render={() => <Tools />} />
                        <Route path='/tools/clan-banner-builder/:decalBackgroundColorId?/:decalColorId?/:decalId?/:gonfalonColorId?/:gonfalonDetailColorId?/:gonfalonDetailId?/:gonfalonId?/' exact render={route => <ClanBannerBuilder {...route} />} />
                        <Route path='/' exact render={() => <Index />} />
                      </Switch>
                    </div>
                    <Route path='/' render={route => <Footer route={route} />} />
                  </div>
                )}
              />
            </Router>
          </BraytechContext.Provider>
        );
      } else {
        return (
          <BraytechContext.Provider value={this.state.theme}>
            <Router>
              <Route
                render={route => (
                  <div className={cx('wrapper', this.state.theme.selected, { 'profile-route': isProfileRoute(route.location.pathname) })}>
                    <Route path='/' render={route => <Notifications updateAvailable={this.props.updateAvailable} />} />
                    <GoogleAnalytics.RouteTracker />
                    <div className='main'>
                      <Route path='/' render={route => <Header route={route} {...this.state} manifest={this.manifest} />} />
                      <Switch>
                        <Route path='/character-select' render={route => <CharacterSelect getProfile={getProfile} setProfile={this.setProfile} location={route.location} user={this.state.user} viewport={this.state.viewport} manifest={this.manifest} />} />
                        <Route
                          path='/account'
                          exact
                          render={route => (
                            <Redirect
                              to={{
                                pathname: '/character-select',
                                state: { from: route.location }
                              }}
                            />
                          )}
                        />
                        <Route
                          path='/clan/:view?/:subView?'
                          exact
                          render={route => (
                            <Redirect
                              to={{
                                pathname: '/character-select',
                                state: { from: route.location }
                              }}
                            />
                          )}
                        />
                        <Route
                          path='/character'
                          exact
                          render={route => (
                            <Redirect
                              to={{
                                pathname: '/character-select',
                                state: { from: route.location }
                              }}
                            />
                          )}
                        />
                        <Route
                          path='/checklists'
                          exact
                          render={route => (
                            <Redirect
                              to={{
                                pathname: '/character-select',
                                state: { from: route.location }
                              }}
                            />
                          )}
                        />
                        <Route
                          path='/collections/:primary?/:secondary?/:tertiary?/:quaternary?'
                          render={route => (
                            <Redirect
                              to={{
                                pathname: '/character-select',
                                state: { from: route.location }
                              }}
                            />
                          )}
                        />
                        <Route
                          path='/triumphs/:primary?/:secondary?/:tertiary?/:quaternary?'
                          render={route => (
                            <Redirect
                              to={{
                                pathname: '/character-select',
                                state: { from: route.location }
                              }}
                            />
                          )}
                        />
                        <Route
                          path='/this-week'
                          exact
                          render={route => (
                            <Redirect
                              to={{
                                pathname: '/character-select',
                                state: { from: route.location }
                              }}
                            />
                          )}
                        />
                        <Route path='/vendors/:hash?' exact render={route => <Vendors vendorHash={route.match.params.hash} manifest={this.manifest} />} />
                        <Route path='/settings' exact render={() => <Settings {...this.state.user} manifest={this.manifest} availableLanguages={this.availableLanguages} />} />
                        <Route path='/pride' exact render={() => <Pride />} />
                        <Route path='/credits' exact render={() => <Credits />} />
                        <Route path='/tools' exact render={() => <Tools />} />
                        <Route path='/tools/clan-banner-builder/:decalBackgroundColorId?/:decalColorId?/:decalId?/:gonfalonColorId?/:gonfalonDetailColorId?/:gonfalonDetailId?/:gonfalonId?/' exact render={route => <ClanBannerBuilder {...route} />} />
                        <Route path='/' render={() => <Index />} />
                      </Switch>
                    </div>
                    <Route path='/' render={route => <Footer route={route} />} />
                  </div>
                )}
              />
            </Router>
          </BraytechContext.Provider>
        );
      }
    }
  }
}

export default withNamespaces()(App);
