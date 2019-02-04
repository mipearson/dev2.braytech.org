/* eslint-disable jsx-a11y/anchor-is-valid */
import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withNamespaces, WithNamespaces } from 'react-i18next';
import cx from 'classnames';

import './styles.css';

import ChecklistFactory from './ChecklistFactory';

function getItemsPerPage(width: number) {
  if (width >= 2000) return 5;
  if (width >= 1600) return 4;
  if (width >= 1200) return 3;
  if (width >= 800) return 2;
  return 1;
}

interface ListButtonProps {
  name: string;
  onClick: (event: React.MouseEvent<HTMLAnchorElement,MouseEvent>) => void;
  icon?: string | undefined;
  visible?: boolean;
}

const ListButton = (p: ListButtonProps) => (
  <li key={p.name} className='linked'>
    <a
      className={cx({
        active: p.visible
      })}
      onClick={p.onClick}
    >
      <div className={p.icon} />
      <div className='name'>{p.name}</div>
    </a>
  </li>
);

interface ChecklistProps extends WithNamespaces {
  member: any;
  collectibles?: any;
  theme?: any;
  viewport?: any;
}

export class Checklists extends React.Component<ChecklistProps> {
  state: {
    page: number;
    itemsPerPage: number;
  };

  constructor(props: ChecklistProps) {
    super(props);

    this.state = {
      page: 0,
      itemsPerPage: getItemsPerPage(props.viewport.width)
    };
  }

  componentDidUpdate(prev: ChecklistProps) {
    const newWidth = this.props.viewport.width;
    if (prev.viewport.width !== newWidth) {
      this.setState({ itemsPerPage: getItemsPerPage(newWidth) });
    }
  }

  changeSkip = (index: number) => {
    this.setState({
      page: Math.floor(index / this.state.itemsPerPage)
    });
  };

  render() {
    const { t, member, collectibles, theme } = this.props;
    const { page, itemsPerPage } = this.state;

    const f = new ChecklistFactory(t, member.data.profile, member.characterId, collectibles.hideChecklistItems);

    const lists = [
      f.regionChests(), //
      f.lostSectors(),
      f.adventures(),
      f.corruptedEggs(),
      f.amkaharaBones(),
      f.catStatues(),
      f.sleeperNodes(),
      f.ghostScans(),
      f.latentMemories(),
      f.ghostStories(),
      f.awokenOfTheReef(),
      f.forsakenPrince()
    ];

    if (Object.values(member.data.profile.profileProgression.data.checklists[2448912219]).filter(i => i).length === 4) {
      lists.push(f.caydesJournals());
    }

    let sliceStart = page * itemsPerPage;
    let sliceEnd = sliceStart + itemsPerPage;

    const visible = lists.slice(sliceStart, sliceEnd);

    return (
      <div className={cx('view', theme.selected)} id='checklists'>
        <div className='views'>
          <div className='sub-header sub'>
            <div>Checklists</div>
          </div>
          <ul className='list'>
            {lists.map((list, i) => (
              <ListButton name={list.name} icon={list.icon} key={i} visible={visible.includes(list)} onClick={() => this.changeSkip(i)} />
            ))}
          </ul>
        </div>
        <div className={cx('lists', 'col-' + this.state.itemsPerPage)}>
          {visible.map(list => (
            <div className='col' key={list.name}>
              {list.checklist}
            </div>
          ))}
        </div>
      </div>
    );
  }
}

function mapStateToProps(state: any, ownProps: any): Partial<ChecklistProps> {
  return {
    member: state.member,
    collectibles: state.collectibles,
    theme: state.theme
  };
}

export default compose(
  connect(mapStateToProps),
  withNamespaces()
)(Checklists);
