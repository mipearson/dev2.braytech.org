/* eslint-disable jsx-a11y/anchor-is-valid */
import React from 'react';
import cx from 'classnames';
import assign from 'lodash/assign';
import { withNamespaces } from 'react-i18next';

import BraytechContext from '../../BraytechContext';

import Characters from '../../components/Characters';
import Globals from '../../utils/globals';
import * as responseUtils from '../../utils/responseUtils';
import * as destinyEnums from '../../utils/destinyEnums';
import * as ls from '../../utils/localStorage';
import errorHandler from '../../utils/errorHandler';
import Spinner from '../../components/Spinner';

import './styles.css';

class CharacterSelect extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      search: {
        results: false
      },
      profile: {
        data: false
      },
      error: false,
      loading: true
    };
  }

  SearchDestinyPlayer = e => {
    let membershipType = '-1';
    let displayName = e.target.value;

    clearTimeout(this.inputTimeout);
    this.inputTimeout = setTimeout(() => {
      fetch(`https://www.bungie.net/Platform/Destiny2/SearchDestinyPlayer/${membershipType}/${encodeURIComponent(displayName)}/`, {
        headers: {
          'X-API-Key': Globals.key.bungie
        }
      })
        .then(response => {
          return response.json();
        })
        .then(SearchResponse => {
          if (SearchResponse.ErrorCode !== 1) {
            console.log(SearchResponse);
            this.setState({ error: SearchResponse.ErrorCode });
            return;
          }
          this.setState({
            results: SearchResponse.Response,
            error: false
          });
        })
        .catch(error => {
          console.log(error);
        });
    }, 1000);
  };

  characterClick = characterId => {
    this.props.setProfile(this.state.profile.data.profile.profile.data.userInfo.membershipType, this.state.profile.data.profile.profile.data.userInfo.membershipId, characterId, this.state.profile.data, true);
  };

  resultClick = (membershipType, membershipId, displayName) => {
    window.scrollTo(0, 0);

    this.getProfile(membershipType, membershipId, this.getProfileCallback);

    if (displayName) {
      ls.update('history.profiles', { membershipType: membershipType, membershipId: membershipId, displayName: displayName }, true, 6);
    }
  };

  getProfile = (membershipType, membershipId) => {
    this.setState({ loading: true, error: false });

    this.props
      .getProfile(membershipType, membershipId)
      .then(data => {
        this.setState({ loading: false, profile: { data } });
      })
      .catch(error => {
        this.setState({
          loading: false,
          error
        });
      });
  };

  componentDidMount() {
    window.scrollTo(0, 0);
    if (this.props.user.data) {
      this.setState({ profile: { data: this.props.user.data }, loading: false });
    } else if (this.props.user.membershipId && !this.state.profile.data) {
      this.getProfile(this.props.user.membershipType, this.props.user.membershipId);
    } else {
      this.setState({ loading: false });
    }
  }

  render() {
    const { t } = this.props;
    let profileHistory = ls.get('history.profiles') ? ls.get('history.profiles') : [];
    let resultsElement = null;
    let profileElement = null;

    if (this.state.search.results) {
      resultsElement = (
        <div className='results'>
          <ul className='list'>
            {this.state.search.results.length > 0 ? (
              this.state.search.results.map(result => (
                <li className='linked' key={result.membershipId}>
                  <a
                    onClick={e => {
                      this.ResultHandler(result.membershipType, result.membershipId, false, result.displayName);
                    }}
                  >
                    <span className={`destiny-platform_${destinyEnums.PLATFORMS[result.membershipType].toLowerCase()}`} />
                    {result.displayName}
                  </a>
                </li>
              ))
            ) : (
              <li className='no-profiles'>{t('No profiles found')}</li>
            )}
          </ul>
        </div>
      );
    } else {
      resultsElement = <div className='results' />;
    }

    const { from } = this.props.location.state || { from: { pathname: '/' } };

    if (this.state.profile.data) {
      let clan = null;
      if (this.state.profile.data.groups.results.length === 1) {
        clan = <div className='clan'>{this.state.profile.data.groups.results[0].group.name}</div>;
      }

      let timePlayed = (
        <div className='timePlayed'>
          {Math.floor(
            Object.keys(this.state.profile.data.profile.characters.data).reduce((sum, key) => {
              return sum + parseInt(this.state.profile.data.profile.characters.data[key].minutesPlayedTotal);
            }, 0) / 1440
          )}{' '}
          {t('days on the grind')}
        </div>
      );

      profileElement = (
        <>
          <div className='user'>
            <div className='info'>
              <div className='displayName'>{this.state.profile.data.profile.profile.data.userInfo.displayName}</div>
              {clan}
              {timePlayed}
            </div>
            <Characters data={this.state.profile.data} manifest={this.props.manifest} location={{ ...from }} characterClick={this.characterClick} />
          </div>
        </>
      );
    }

    let reverse = false;
    if (this.props.viewport.width <= 500) {
      reverse = true;
    }

    let errorNotices = null;
    if (this.state.error) {
      errorNotices = errorHandler(this.state.error);
    }

    return (
      <BraytechContext.Consumer>
        {theme => (
          <div className={cx('view', theme.selected, { loading: this.state.loading })} id='get-profile'>
            {reverse ? (
              <div className='profile'>
                {this.state.loading ? <Spinner dark /> : null}
                {profileElement}
              </div>
            ) : null}
            <div className='search'>
              {errorNotices}
              <div className='sub-header sub'>
                <div>{t('Search for player')}</div>
              </div>
              <div className='form'>
                <div className='field'>
                  <input onInput={this.SearchDestinyPlayer} type='text' placeholder={t('insert gamertag')} spellCheck='false' />
                </div>
              </div>
              <div className='results'>{resultsElement}</div>
              {profileHistory.length > 0 ? (
                <>
                  <div className='sub-header sub'>
                    <div>{t('Previous')}</div>
                  </div>
                  <div className='results'>
                    <ul className='list'>
                      {profileHistory.map(result => (
                        <li className='linked' key={result.membershipId}>
                          <a
                            onClick={e => {
                              this.resultClick(result.membershipType, result.membershipId, result.displayName);
                            }}
                          >
                            <span className={`destiny-platform_${destinyEnums.PLATFORMS[result.membershipType].toLowerCase()}`} />
                            {result.displayName}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              ) : null}
            </div>
            {!reverse ? (
              <div className='profile'>
                {this.state.loading ? <Spinner dark /> : null}
                {profileElement}
              </div>
            ) : null}
          </div>
        )}
      </BraytechContext.Consumer>
    );
  }
}

export default withNamespaces()(CharacterSelect);
