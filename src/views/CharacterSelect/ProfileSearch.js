/* eslint-disable jsx-a11y/anchor-is-valid */
import React from 'react';
import { withNamespaces } from 'react-i18next';
import * as destinyEnums from '../../utils/destinyEnums';
import * as ls from '../../utils/localStorage';
import PropTypes from 'prop-types';
import * as bungie from '../../utils/bungie';
import debounce from 'lodash/debounce';

import './styles.css';

const SearchResult = p => (
  <li className='linked'>
    <a onClick={() => p.onProfileClick(p.profile.membershipType, p.profile.membershipId, p.profile.displayName)}>
      <span className={`destiny-platform_${destinyEnums.PLATFORMS[p.profile.membershipType].toLowerCase()}`} />
      {p.profile.displayName}
    </a>
  </li>
);

SearchResult.propTypes = {
  onProfileClick: PropTypes.func.isRequired,
  profile: PropTypes.object
};

class ProfileSearch extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      results: false
    };
    this.mounted = false;
  }

  componentWillMount() {
    this.mounted = true;
  }

  componentWillUnmount() {
    // If we don't do this, the searchForPlayers may attempt to setState on
    // an unmounted component. We can't cancel it effectively as it's using
    // fetch, which doesn't support cancels :(
    this.mounted = false;
  }

  onSearchInput = e => {
    const displayName = e.target.value;
    if (!displayName) return;

    this.searchForPlayers(displayName);
  };

  searchForPlayers = debounce(async displayName => {
    try {
      const results = await bungie.playerSearch('-1', displayName);
      if (this.mounted) this.setState({ results: results });
    } catch (e) {
      // If we get an error here it's usually because somebody is being cheeky
      // (eg entering invalid search data), so log it only.
      console.warn(`Error while searching for ${displayName}: ${e}`);
    }
  }, 1000);

  profileList = profiles => profiles.map(p => <SearchResult key={p.membershipId} onProfileClick={this.props.onProfileClick} profile={p} />);

  render() {
    const { t } = this.props;
    const { results } = this.state;

    let history = ls.get('history.profiles') || [];

    return (
      <>
        <div className='sub-header sub'>
          <div>{t('Search for player')}</div>
        </div>

        <div className='form'>
          <div className='field'>
            <input onInput={this.onSearchInput} type='text' placeholder={t('insert gamertag')} spellCheck='false' />
          </div>
        </div>

        {this.state.results && (
          <div className='results'>
            <ul className='list'>
              {this.profileList(results)}
              {results.length === 0 && <li className='no-profiles'>{t('No profiles found')}</li>}
            </ul>
          </div>
        )}

        {history.length > 0 && (
          <>
            <div className='sub-header sub'>
              <div>{t('Previous')}</div>
            </div>
            <div className='results'>
              <ul className='list'>{this.profileList(history)}</ul>
            </div>
          </>
        )}
      </>
    );
  }
}

ProfileSearch.propTypes = {
  onProfileClick: PropTypes.func.isRequired
};

export default withNamespaces()(ProfileSearch);
