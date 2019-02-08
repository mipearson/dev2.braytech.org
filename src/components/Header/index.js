import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { withNamespaces } from 'react-i18next';
import cx from 'classnames';

import manifest from '../../utils/manifest';
import ObservedImage from '../../components/ObservedImage';
import ProgressBar from '../../components/ProgressBar';
import { classHashToString } from '../../utils/destinyUtils';
import { ProfileNavLink } from '../../components/ProfileLink';

import './styles.css';

class Header extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      navOpen: false
    };
  }

  toggleNav = () => {
    if (!this.state.navOpen) {
      this.setState({ navOpen: true });
    } else {
      this.setState({ navOpen: false });
    }
  };

  closeNav = () => {
    if (this.state.navOpen) {
      this.setState({ navOpen: false });
    }
  };

  navOverlayLink = state => {
    console.log('fuck');
    if (state) {
      return (
        <div className='trigger' onClick={this.toggleNav}>
          <i className='uniE106' />
          Exit
        </div>
      );
    } else {
      return (
        <div className='trigger' onClick={this.toggleNav}>
          <i className='uniEA55' />
          Views
        </div>
      );
    }
  };

  render() {
    const { t, viewport, member, refreshService, theme } = this.props;
    let views = [
      {
        name: t('Clan'),
        desc: t('Activity and statistics'),
        slug: '/clan',
        exact: false
      },
      {
        name: t('Collections'),
        desc: t('Items your Guardian has acquired'),
        slug: '/collections',
        exact: false
      },
      {
        name: t('Triumphs'),
        desc: t("Records of your Guardian's achievements"),
        slug: '/triumphs',
        exact: false
      },
      // {
      //   name: t('Character'),
      //   desc: t('Character (dev only)'),
      //   slug: '/character',
      //   exact: true,
      //   dev: true
      // },
      {
        name: t('Account'),
        desc: t("Bird's eye view of your overall progress"),
        slug: '/account',
        exact: true
      },
      {
        name: t('Checklists'),
        desc: t('Made a list, check it twice'),
        slug: '/checklists',
        exact: true
      },
      {
        name: t('This Week'),
        desc: t('Prestigious records and valued items up for grabs this week'),
        slug: '/this-week',
        exact: true
      },
      {
        name: t('Vendors'),
        desc: t("Tracking what's in stock across the Jovians"),
        slug: '/vendors',
        exact: false
      },
      {
        name: t('Resources'),
        desc: t('Assorted Destiny-related resources'),
        slug: '/resources',
        exact: false
      },
      {
        name: <span className='destiny-settings' />,
        desc: 'Theme, language, collectible display state',
        slug: '/settings',
        exact: true
      }
    ];

    let viewsInline = false;
    if (viewport.width >= 1360) {
      viewsInline = true;
    }

    let profileEl = null;

    if (member.data) {
      const characterId = member.characterId;
      const profile = member.data.profile.profile.data;
      const characters = member.data.profile.characters.data;
      const characterProgressions = member.data.profile.characterProgressions.data;

      const character = characters.find(character => character.characterId === characterId);

      const capped = characterProgressions[character.characterId].progressions[1716568313].level === characterProgressions[character.characterId].progressions[1716568313].levelCap ? true : false;

      const emblemDefinition = manifest.DestinyInventoryItemDefinition[character.emblemHash];

      const progress = capped ? characterProgressions[character.characterId].progressions[2030054750].progressToNextLevel / characterProgressions[character.characterId].progressions[2030054750].nextLevelAt : characterProgressions[character.characterId].progressions[1716568313].progressToNextLevel / characterProgressions[character.characterId].progressions[1716568313].nextLevelAt;

      profileEl = (
        <div className='profile'>
          <div className={cx('background', { 'update-flash': this.state.updateFlash })}>
            <ObservedImage
              className={cx('image', 'emblem', {
                missing: emblemDefinition.redacted
              })}
              src={`https://www.bungie.net${emblemDefinition.secondarySpecial ? emblemDefinition.secondarySpecial : `/img/misc/missing_icon_d2.png`}`}
            />
          </div>
          <div className='ui'>
            <div className='characters'>
              <ul className='list'>
                <li>
                  <ObservedImage
                    className={cx('image', 'secondaryOverlay', {
                      missing: emblemDefinition.redacted
                    })}
                    src={`https://www.bungie.net${!emblemDefinition.redacted ? emblemDefinition.secondaryOverlay : `/img/misc/missing_icon_d2.png`}`}
                  />
                  <div className='displayName'>{profile.userInfo.displayName}</div>
                  <div className='basics'>
                    {character.baseCharacterLevel} / {classHashToString(character.classHash, character.genderType)} / <span className='light'>{character.light}</span>
                  </div>
                  <ProgressBar
                    classNames={{
                      capped: capped
                    }}
                    objectiveDefinition={{
                      completionValue: 1
                    }}
                    playerProgress={{
                      progress: progress
                    }}
                    hideCheck
                  />
                  <Link
                    to={{
                      pathname: '/character-select',
                      state: { from: this.props.route.location }
                    }}
                  />
                </li>
              </ul>
            </div>
            {viewsInline ? (
              <div className='views'>
                <ul>
                  {views.map(view => {
                    let to = view.slug;
                    return (
                      <li key={view.slug}>
                        <ProfileNavLink to={to} exact={view.exact}>
                          {view.name}
                        </ProfileNavLink>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ) : null}
          </div>
        </div>
      );
    }

    return (
      <div id='header' className={cx('profile-header', this.props.theme.selected, { navOpen: this.state.mobileNavOpen })}>
        <div className='braytech'>
          <div className='logo'>
            <Link to='/'>
              <span className='destiny-clovis_bray_device' />
              Braytech
            </Link>
          </div>
          {!viewsInline ? this.navOverlayLink(this.state.navOpen) : null}
        </div>
        {profileEl}
      </div>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    member: state.member,
    refreshService: state.refreshService,
    theme: state.theme
  };
}

export default compose(
  connect(mapStateToProps),
  withNamespaces()
)(Header);
