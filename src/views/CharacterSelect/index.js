/* eslint-disable jsx-a11y/anchor-is-valid */
import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import cx from 'classnames';
import { withNamespaces } from 'react-i18next';

import getProfile from '../../utils/profile';
import * as ls from '../../utils/localStorage';
import Spinner from '../../components/Spinner';
import errorHandler from '../../utils/errorHandler';

import ProfileSearch from './ProfileSearch';
import Profile from './Profile';

import './styles.css';
import store from '../../utils/reduxStore';

class CharacterSelect extends React.Component {
  componentDidMount() {
    window.scrollTo(0, 0);

    if (this.props.profile.membershipId && !this.props.profile.data) getProfile();
  }

  characterClick = characterId => {
    ls.set('setting.profile', {
      membershipType: this.props.profile.membershipType,
      membershipId: this.props.profile.membershipId,
      characterId
    });

    store.dispatch({
      type: 'PROFILE_CHARACTER_SELECT',
      payload: characterId
    });
  };

  profileClick = (membershipType, membershipId, displayName) => {
    window.scrollTo(0, 0);

    store.dispatch({ type: 'PROFILE_MEMBERSHIP_SELECT', payload: { membershipType, membershipId } });
    getProfile();

    if (displayName) {
      ls.update('history.profiles', { membershipType: membershipType, membershipId: membershipId, displayName: displayName }, true, 6);
    }
  };

  render() {
    const { profile, theme, viewport, manifest } = this.props;

    const { from } = this.props.location.state || { from: { pathname: '/' } };
    const reverse = viewport.width <= 500;

    const profileCharacterSelect = (
      <div className='profile'>
        {profile.loading && <Spinner />}
        {profile.data && <Profile profile={profile} manifest={manifest} onCharacterClick={this.characterClick} from={from} />}
      </div>
    );

    return (
      <div className={cx('view', theme.selected, { loading: profile.loading })} id='get-profile'>
        {reverse && profileCharacterSelect}

        <div className='search'>
          {profile.error && errorHandler(profile.error)}
          <ProfileSearch onProfileClick={this.profileClick} />
        </div>

        {!reverse && profileCharacterSelect}
      </div>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    profile: state.profile,
    theme: state.theme
  };
}

export default compose(
  connect(mapStateToProps),
  withNamespaces()
)(CharacterSelect);
