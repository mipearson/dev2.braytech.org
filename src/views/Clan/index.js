import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withNamespaces } from 'react-i18next';
import cx from 'classnames';

import store from '../../utils/reduxStore';
import * as responseUtils from '../../utils/responseUtils';
import * as bungie from '../../utils/bungie';

import './styles.css';
import AboutView from './about.js';
import RosterView from './roster.js';

class Clan extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  async getMembers(members) {
    return await Promise.all(
      members.map(async member => {
        try {
          const [profile, historicalStats] = await Promise.all([bungie.memberProfile(member.destinyUserInfo.membershipType, member.destinyUserInfo.membershipId, '100,200,202,204,900'), bungie.getHistoricalStats(member.destinyUserInfo.membershipType, member.destinyUserInfo.membershipId, '1,3', '3,4,5,6,7,16,19,63', '0')]);
          member.profile = profile;
          member.historicalStats = historicalStats;
          
          if (!member.profile.characterProgressions.data) {
            return member;
          }
          member.profile = responseUtils.profileScrubber(member.profile);

          return member;
        } catch (e) {
          member.profile = false;
          member.historicalStats = false;
          return member;
        }
      })
    );
  }

  async liteRefreshPromise(members, fresh) {
    return await Promise.all(
      members.map(async member => {
        let oldProfile = member.profile;
        try {
          const profile = await bungie.memberProfile(member.destinyUserInfo.membershipType, member.destinyUserInfo.membershipId, '100,200,202,204,900');
          member.profile = profile;

          let freshState = fresh && fresh.results.find(freshMember => freshMember.destinyUserInfo.membershipId === member.destinyUserInfo.membershipId);
          if (freshState) {
            member.isOnline = freshState.isOnline;
          }

          if (!member.profile.characterProgressions.data) {
            return member;
          }
          member.profile = responseUtils.profileScrubber(member.profile);

          return member;
        } catch (e) {
          member.profile = oldProfile;
          return member;
        }
      })
    );
  }

  refreshActive = false;

  liteRefresh = async () => {
    if (this.refreshActive) {
      return;
    }
    this.refreshActive = true;

    store.dispatch({
      type: 'GROUP_MEMBERS_LOADING'
    });
    
    let groupMembersResponse = false;
    try {
      groupMembersResponse = await bungie.groupMembers(this.props.groupMembers.groupId);
    } catch(e) {

    }
    let memberResponses = await this.liteRefreshPromise(this.props.groupMembers.responses, groupMembersResponse);

    let payload = {
      groupId: this.props.groupMembers.groupId,
      responses: memberResponses,
    }

    store.dispatch({
      type: 'GROUP_MEMBERS_LOADED',
      payload
    });
    this.refreshActive = false;
  }

  async componentDidMount() {
    const { member, groupMembers } = this.props;
    const group = member.data.groups.results.length > 0 ? member.data.groups.results[0].group : false;

    if ((group.groupId && groupMembers.responses.length === 0) || group.groupId !== groupMembers.groupId) {
      if (this.refreshActive) {
        return;
      }
      this.refreshActive = true;

      store.dispatch({
        type: 'GROUP_MEMBERS_LOADING'
      });

      const groupMembersResponse = await bungie.groupMembers(group.groupId);
      let memberResponses = await this.getMembers(groupMembersResponse.results);

      let payload = {
        groupId: group.groupId,
        responses: memberResponses,
      }

      store.dispatch({
        type: 'GROUP_MEMBERS_LOADED',
        payload
      });
      this.refreshActive = false;

      this.startInterval();
    } else if (group.groupId && groupMembers.responses.length) {
      this.startInterval();
    } else {

    }
  }

  startInterval() {
    this.refreshClanDataInterval = window.setInterval(this.liteRefresh, 60000);
  }

  clearInterval() {
    window.clearInterval(this.refreshClanDataInterval);
  }

  componentWillUnmount() {
    this.clearInterval();
  }

  render() {
    const { t, member, theme } = this.props;
    const group = member.data.groups.results.length > 0 ? member.data.groups.results[0].group : false;

    if (group) {
      if (this.props.view === 'roster') {
        return <RosterView {...this.props} group={group} />;
      } else {
        return <AboutView {...this.props} group={group} />;
      }
    } else {
      return (
        <div className={cx('view', theme.selected)} id='clan'>
          <div className='no-clan'>
            <div className='properties'>
              <div className='name'>{t('No clan affiliation')}</div>
              <div className='description'>
                <p>{t('Clans are optional groups of friends that enhance your online gaming experience. Coordinate with your clanmates to take on co-op challenges or just simply represent them in your solo play to earn extra rewards.')}</p>
                <p>{t("Join your friend's clan, meet some new friends, or create your own on the companion app or at bungie.net.")}</p>
              </div>
            </div>
          </div>
        </div>
      );
    }
  }
}

function mapStateToProps(state, ownProps) {
  return {
    member: state.member,
    groupMembers: state.groupMembers,
    theme: state.theme
  };
}

export default compose(
  connect(mapStateToProps),
  withNamespaces()
)(Clan);
