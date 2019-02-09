import React from 'react';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';

import store from './utils/reduxStore';
import getMember from './utils/getMember';

import Clan from './views/Clan';
import Collections from './views/Collections';
import Triumphs from './views/Triumphs';
import Checklists from './views/Checklists';
import Account from './views/Account';
import ThisWeek from './views/ThisWeek';

class ProfileRoutes extends React.Component {
  async componentDidMount() {
    const { member, location, match } = this.props;
    const { membershipId, membershipType, characterId } = match.params;
    console.log(member, location, match);

    if (!member.data || member.membershipId !== membershipId || member.membershipType !== membershipType) {
      store.dispatch({
        type: 'MEMBER_LOADING_NEW_MEMBERSHIP',
        payload: { membershipId, membershipType }
      });

      try {
        const data = await getMember(membershipType, membershipId);
        store.dispatch({
          type: 'MEMBER_LOADED',
          payload: data
        });
      } catch (error) {
        console.log(error);
      }
    }

    if (member.characterId !== characterId) {
      store.dispatch({ type: 'MEMBER_SELECT_CHARACTER', payload: characterId });
    }
  }

  render() {
    const { member, location, match } = this.props;
    console.log(member, location, match);

    if (!member.data) {
      return 'loading member data based on url params';
    } else {
      return (
        <>
          <Route path={`${match.url}/account`} exact render={route => <Account />} />
          <Route path={`${match.url}/clan/:view?/:subView?`} exact render={route => <Clan view={route.match.params.view} subView={route.match.params.subView} />} />
          <Route path={`${match.url}/checklists`} exact render={() => <Checklists viewport={this.props.viewport} />} />
          <Route path={`${match.url}/collections/:primary?/:secondary?/:tertiary?/:quaternary?`} render={route => <Collections {...route} />} />
          <Route path={`${match.url}/triumphs/:primary?/:secondary?/:tertiary?/:quaternary?`} render={route => <Triumphs {...route} />} />
          <Route path={`${match.url}/this-week`} exact render={() => <ThisWeek />} />
        </>
      );
    }
  }
}

function mapStateToProps(state, ownProps) {
  return {
    member: state.member
  };
}

export default connect(mapStateToProps)(ProfileRoutes);
