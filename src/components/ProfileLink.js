import React from 'react';
import { connect } from 'react-redux';
import { Link, NavLink } from 'react-router-dom';

function BuildProfileLink({ to, children, component, member, ...rest }) {
  const LinkComponent = component || Link;

  let memberPrefix = member.membershipId ? `/${member.membershipType}/${member.membershipId}/${member.characterId}` : '';

  return (
    <LinkComponent {...rest} to={{ pathname: `${memberPrefix}${to}` }}>
      {children}
    </LinkComponent>
  );
}

function BuildProfileNavLink(props) {
  return <ProfileLink {...props} component={NavLink} />;
}

function mapStateToProps(state, ownProps) {
  return {
    member: state.member
  };
}

export const ProfileLink = connect(mapStateToProps)(BuildProfileLink);
export const ProfileNavLink = connect(mapStateToProps)(BuildProfileNavLink);