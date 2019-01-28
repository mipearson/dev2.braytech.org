/* eslint-disable jsx-a11y/anchor-is-valid */
import React from 'react';
import { withNamespaces } from 'react-i18next';
import * as destinyEnums from '../../utils/destinyEnums';
import * as ls from '../../utils/localStorage';
import errorHandler from '../../utils/errorHandler';
import PropTypes from 'prop-types';
import * as bungie from '../../utils/bungie';

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
      results: false,
      error: false
    };
  }

  onSearchInput = e => {
    let membershipType = '-1';
    let displayName = e.target.value;

    clearTimeout(this.inputTimeout);
    this.inputTimeout = setTimeout(async () => {
      if (!displayName) {
        return;
      }
      const results = await bungie.playerSearch(membershipType, displayName);

      this.setState({
        results,
        error: false
      });
    }, 1000);
  };

  profileList = profiles => profiles.map(p => <SearchResult key={p.membershipId} onProfileClick={this.props.onProfileClick} profile={p} />);

  render() {
    const { t } = this.props;
    const { results } = this.state;

    let history = ls.get('history.profiles') || [];

    return (
      <div className='search'>
        {this.state.error && errorHandler(this.state.error)}

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
      </div>
    );
  }
}

ProfileSearch.propTypes = {
  onProfileClick: PropTypes.func.isRequired
};

export default withNamespaces()(ProfileSearch);
