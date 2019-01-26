import React from 'react';
import cx from 'classnames';
import ObservedImage from '../../components/ObservedImage';

import './styles.css';

export default function Item(props) {
  let manifest = this.props.manifest;
  let item = manifest.DestinyInventoryItemDefinition[props.hash];
  
  let src = item.redacted ? `https://www.bungie.net${props.manifest.settings.destiny2CoreSettings.undiscoveredCollectibleImage}` : `https://www.bungie.net${itemDefinition.displayProperties.icon}`;

  return (
    <li className={cx('item', 'tooltip')} data-itemhash={item.hash}>
    <div className="icon">
      <ObservedImage className={cx('image', 'icon')} src={src} />
    </div>
  </li>);
}

// usage:
// <ul>
//    { itemHashes.map(i => <Item manifest={props.manifest} hash={i} key={i}/>)}
// </ul>
