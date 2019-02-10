import React from 'react';
import { connect } from 'react-redux';
import { Route, Switch, Redirect } from 'react-router-dom';

import store from './utils/reduxStore';

import Clan from './views/Clan';
import Collections from './views/Collections';
import Triumphs from './views/Triumphs';
import Checklists from './views/Checklists';
import Account from './views/Account';
import ThisWeek from './views/ThisWeek';
import Header from './components/Header';
import Spinner from './components/Spinner';

class ProfileRoutes extends React.Component {
  componentDidMount() {
    const { membershipId, membershipType, characterId } = this.props.match.params;

    store.dispatch({
      type: 'MEMBER_SET_BY_PROFILE_ROUTE',
      payload: { membershipType, membershipId, characterId }
    });
  }

  render() {
    const { member, location, match } = this.props;
    console.log(member, location, match);

    if (member.error) {
      // Character select will be able to display the error for us & prompt
      // them to pick a new character / member
      return <Redirect to={{ pathname: '/character-select', state: { from: location } }} />;
    }

    if (!member.data) {
      return (
        <>
          <Route path='/' render={route => <Header route={route} {...this.state} {...this.props} isProfileRoute />} />
          <Spinner />
        </>
      );
    }

    return (
      <>
        <Route path='/' render={route => <Header route={route} {...this.state} {...this.props} isProfileRoute />} />
        <Switch>
          <Route path={`${match.url}/account`} exact render={route => <Account />} />
          <Route path={`${match.url}/clan/:view?/:subView?`} exact render={route => <Clan view={route.match.params.view} subView={route.match.params.subView} />} />
          <Route path={`${match.url}/checklists`} exact component={Checklists} />
          <Route path={`${match.url}/collections/:primary?/:secondary?/:tertiary?/:quaternary?`} render={route => <Collections {...route} />} />
          <Route path={`${match.url}/triumphs/:primary?/:secondary?/:tertiary?/:quaternary?`} render={route => <Triumphs {...route} />} />
          <Route path={`${match.url}/this-week`} exact render={() => <ThisWeek />} />
        </Switch>
      </>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    member: state.member
  };
}

export default connect(mapStateToProps)(ProfileRoutes);
