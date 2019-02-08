/* eslint-disable jsx-a11y/anchor-is-valid */
import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import cx from 'classnames';
import { withNamespaces } from 'react-i18next';

import store from '../../utils/reduxStore';
import getMember from '../../utils/getMember';
import * as ls from '../../utils/localStorage';
import Spinner from '../../components/Spinner';
import ProfileError from './ProfileError';

import ProfileSearch from './ProfileSearch';
import Profile from './Profile';

import './styles.css';

class CharacterSelect extends React.Component {
  componentDidMount() {
    window.scrollTo(0, 0);
  }

  characterClick = characterId => {
    ls.set('setting.profile', {
      membershipType: this.props.member.membershipType,
      membershipId: this.props.member.membershipId,
      characterId
    });

    store.dispatch({
      type: 'MEMBER_CHARACTER_SELECT',
      payload: characterId
    });
  };

  profileClick = async (membershipType, membershipId, displayName) => {
    window.scrollTo(0, 0);

    store.dispatch({ type: 'MEMBER_LOADING_NEW_MEMBERSHIP', payload: { membershipType, membershipId } });

    try {
      const data = await getMember(membershipType, membershipId);

      if (!data.profile.characterProgressions.data) {
        store.dispatch({ type: 'MEMBER_LOAD_ERROR', payload: new Error('private') });
        return;
      }

      store.dispatch({ type: 'MEMBER_LOADED', payload: data });
    } catch (error) {
      store.dispatch({ type: 'MEMBER_LOAD_ERROR', payload: error });
      return;
    }

    if (displayName) {
      ls.update(
        'history.profiles',
        {
          membershipType,
          membershipId,
          displayName
        },
        true,
        6
      );
    }
  };

  render() {
    const { member, theme, viewport } = this.props;
    const { error, loading } = member;
    console.log(member);
    const { from } = this.props.location.state || { from: { pathname: '/' } };
    const reverse = viewport.width <= 500;

    const profileCharacterSelect = (
      <div className='profile'>
        {loading && <Spinner />}
        {member.data && <Profile member={member} onCharacterClick={this.characterClick} from={from} />}
      </div>
    );

    return (
      <div className={cx('view', theme.selected, { loading })} id='get-profile'>
        {reverse && profileCharacterSelect}

        <div className='search'>
          {error && <ProfileError error={error} />}
          <ProfileSearch onProfileClick={this.profileClick} />
        </div>

        {!reverse && profileCharacterSelect}
      </div>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    member: state.member,
    theme: state.theme
  };
}

export default compose(
  connect(mapStateToProps),
  withNamespaces()
)(CharacterSelect);
