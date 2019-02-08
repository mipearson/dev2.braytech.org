import React from 'react';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';

import Clan from './views/Clan';
import Collections from './views/Collections';
import Triumphs from './views/Triumphs';
import Checklists from './views/Checklists';
import Account from './views/Account';
import ThisWeek from './views/ThisWeek';

const Profile = ({ member, location, match, ...rest }) => {
  console.log(member, location, match);
  return (
    <>
      <Route path={`${match.url}/account`} exact render={route => <Account />} />
      <Route path='/clan/:view?/:subView?' exact render={route => <Clan view={route.match.params.view} subView={route.match.params.subView} />} />
      <Route path='/checklists' exact render={() => <Checklists viewport={this.state.viewport} />} />
      <Route path='/collections/:primary?/:secondary?/:tertiary?/:quaternary?' render={route => <Collections {...route} />} />
      <Route path={`${match.url}/triumphs/:primary?/:secondary?/:tertiary?/:quaternary?`} render={route => <Triumphs {...route} />} />
      <Route path='/this-week' exact render={() => <ThisWeek />} />
    </>
  );
};

function mapStateToProps(state, ownProps) {
  return {
    member: state.member
  };
}

export default connect(mapStateToProps)(Profile);
