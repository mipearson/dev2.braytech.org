import React, { Component } from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { BrowserRouter as Router, Route, Redirect, Switch } from 'react-router-dom';
import { withNamespaces } from 'react-i18next';
import cx from 'classnames';
import assign from 'lodash/assign';

import './Core.css';
import './App.css';

import './utils/i18n';
import { Globals, isProfileRoute } from './utils/globals';
import dexie from './utils/dexie';
import GoogleAnalytics from './components/GoogleAnalytics';
import refreshService from './utils/refreshService';

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

class App extends Component {
  constructor(props) {
    super();

    this.state = {
      status: {
        code: false,
        detail: false
      },
      manifest: {
        version: false,
        settings: false
      }
    };

    this.manifest = {};
    this.bungieSettings = {};
    this.currentLanguage = props.i18n.getCurrentLanguage();
  }

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

  componentDidUpdate() {
    if (this.props.refreshService.config.enabled && this.props.profile.data && !window.refreshActive) {
      window.refreshTimer = false;
      refreshService(this.props.profile.membershipType, this.props.profile.membershipId);
    }
  }

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
      return await request.json();
    };

    manifest().then(manifest => {
      let state = this.state;
      state.status.code = 'setManifest';
      this.setState(state);
      dexie
        .table('manifest')
        .clear()
        .then(() => {
          dexie
            .table('manifest')
            .add({
              version: version,
              value: manifest
            })
            .then();
          this.setManifest(manifest);
        });
    });
  };

  componentDidMount() {
    this.updateViewport();
    window.addEventListener('resize', this.updateViewport);

    const getVersion = this.getVersionAndSettings();
    const getManifestFromIndexDb = dexie
      .table('manifest')
      .toCollection()
      .first();

    Promise.all([getVersion, getManifestFromIndexDb])
      .then(([currentVersion, manifest]) => {
        const cachedVersion = manifest && manifest.version;
        if (cachedVersion !== currentVersion) {
          this.getManifest(currentVersion);
        } else {
          this.setManifest(manifest.value);
        }
      })
      .catch(error => {
        let state = this.state;
        state.status.code = 'error';
        state.status.detail = error;
        this.setState(state);
      });
  }

  setManifest = manifest => {
    this.manifest = manifest;
    this.manifest.settings = this.bungieSettings;
    let state = this.state;
    state.status.code = 'ready';
    this.setState(state);
  };

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateViewport);
  }

  render() {
    if (!window.ga) {
      GoogleAnalytics.init();
    }

    if (this.state.status.code !== 'ready') {
      return <Loading state={this.state.status} theme={this.props.theme.selected} />;
    } else {
      if (this.props.profile.data && this.props.profile.characterId) {
        return (
          <Router>
            <Route
              render={route => (
                <div className={cx('wrapper', this.props.theme.selected, { 'profile-route': isProfileRoute(route.location.pathname) })}>
                  <Route path='/' render={route => <Notifications updateAvailable={this.props.updateAvailable} />} />
                  <GoogleAnalytics.RouteTracker />
                  <div className='main'>
                    <Route path='/' render={route => <Header route={route} {...this.state} {...this.props} manifest={this.manifest} />} />
                    <Switch>
                      <Route path='/character-select' render={route => <CharacterSelect location={route.location} user={this.props.profile} viewport={this.state.viewport} manifest={this.manifest} />} />
                      <Route
                        path='/account'
                        exact
                        render={() => (
                          <>
                            <Account manifest={this.manifest} />
                            <Tooltip manifest={this.manifest} />
                          </>
                        )}
                      />
                      <Route path='/clan/:view?/:subView?' exact render={route => <Clan manifest={this.manifest} view={route.match.params.view} subView={route.match.params.subView} />} />
                      <Route path='/character' exact render={() => <Character viewport={this.state.viewport} manifest={this.manifest} />} />
                      <Route path='/checklists' exact render={() => <Checklists viewport={this.state.viewport} manifest={this.manifest} />} />
                      <Route
                        path='/collections/:primary?/:secondary?/:tertiary?/:quaternary?'
                        render={route => (
                          <>
                            <Collections {...route} manifest={this.manifest} />
                            <Tooltip manifest={this.manifest} />
                          </>
                        )}
                      />
                      <Route path='/triumphs/:primary?/:secondary?/:tertiary?/:quaternary?' render={route => <Triumphs {...route} manifest={this.manifest} />} />
                      <Route
                        path='/this-week'
                        exact
                        render={() => (
                          <>
                            <ThisWeek manifest={this.manifest} />
                            <Tooltip manifest={this.manifest} />
                          </>
                        )}
                      />
                      <Route path='/vendors/:hash?' exact render={route => <Vendors vendorHash={route.match.params.hash} manifest={this.manifest} />} />
                      <Route path='/settings' exact render={() => <Settings manifest={this.manifest} availableLanguages={this.availableLanguages} />} />
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
        );
      } else {
        return (
          <Router>
            <Route
              render={route => (
                <div className={cx('wrapper', this.props.theme.selected, { 'profile-route': isProfileRoute(route.location.pathname) })}>
                  <Route path='/' render={route => <Notifications updateAvailable={this.props.updateAvailable} />} />
                  <GoogleAnalytics.RouteTracker />
                  <div className='main'>
                    <Route path='/' render={route => <Header route={route} {...this.state} {...this.props} manifest={this.manifest} />} />
                    <Switch>
                      <Route path='/character-select' render={route => <CharacterSelect location={route.location} user={this.props.profile} viewport={this.state.viewport} manifest={this.manifest} />} />
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
                      <Route path='/settings' exact render={() => <Settings manifest={this.manifest} availableLanguages={this.availableLanguages} />} />
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
        );
      }
    }
  }
}

function mapStateToProps(state, ownProps) {
  return {
    profile: state.profile,
    theme: state.theme,
    refreshService: state.refreshService
  };
}

export default compose(
  connect(mapStateToProps),
  withNamespaces()
)(App);
