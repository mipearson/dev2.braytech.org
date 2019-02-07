import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withNamespaces } from 'react-i18next';
import { Link } from 'react-router-dom';
import cx from 'classnames';

import manifest from '../../utils/manifest';
import ObservedImage from '../../components/ObservedImage';

import './styles.css';

class Inspect extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      from: this.props.location.state && this.props.location.state.from ? this.props.location.state.from : false
    };
  }

  componentDidMount() {
    window.scrollTo(0, 0);
  }

  componentDidUpdate(prevProps) {
    if (this.props.match.params.kind !== prevProps.match.params.kind) {
      window.scrollTo(0, 0);
    }
  }

  render() {
    const { t } = this.props;
    const hash = this.props.match.params.hash ? this.props.match.params.hash : false;
    const item = manifest.DestinyInventoryItemDefinition[hash];

    let backLinkPath = this.state.from;

    let tier;
    if (item.inventory) {
      switch (item.inventory.tierType) {
        case 6:
          tier = 'exotic';
          break;
        case 5:
          tier = 'legendary';
          break;
        case 4:
          tier = 'rare';
          break;
        case 3:
          tier = 'uncommon';
          break;
        case 2:
          tier = 'basic';
          break;
        default:
          tier = 'basic';
      }
    }

    return (
      <div className={cx('view', 'dark-mode')} id='inspect'>
        <div className='bg' />
        <div className={cx('rarity', tier)} />
        <div className='wrap'></div>
      </div>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    theme: state.theme,
    member: state.member
  };
}

export default compose(
  connect(mapStateToProps),
  withNamespaces()
)(Inspect);
