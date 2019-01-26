import React from 'react';
import cx from 'classnames';

import '../../utils/destinyEnums';

import './styles.css';
import fallback from './fallback';
import weapon from './weapon';
import armour from './armour';
import emblem from './emblem';
import bounty from './bounty';
import mod from './mod';
import perk from './perk';

class Tooltip extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      hash: false
    };

    this.tooltip = React.createRef();

    this.bindings = this.bindings.bind(this);
    this.mouseMove = this.mouseMove.bind(this);
    this.touchMovement = false;
  }

  mouseMove = e => {
    let x = 0;
    let y = 0;
    let offset = 0;
    let tooltipWidth = 384;
    let tooltipHeight = this.state.hash ? this.tooltip.current.clientHeight : 0;
    let scrollbarAllowance = 24;

    x = e.clientX;
    y = e.clientY + offset;

    if (x + tooltipWidth + scrollbarAllowance > window.innerWidth) {
      x = x - tooltipWidth - offset;
    } else {
      x = x + offset;
    }

    if (y + tooltipHeight > window.innerHeight) {
      y = y - tooltipHeight - offset;
    }
    y = y < 0 ? 0 : y;

    if (this.state.hash) {
      this.tooltip.current.style.cssText = `top: ${y}px; left: ${x}px`;
    }
  };

  bindings = () => {
    let toolTipples = document.querySelectorAll('.tooltip');
    toolTipples.forEach(item => {
      item.addEventListener('mouseenter', e => {
        if (e.currentTarget.dataset.itemhash) {
          this.setState({
            hash: parseInt(e.currentTarget.dataset.itemhash, 10)
          });
        }
      });
      item.addEventListener('mouseleave', e => {
        this.setState({
          hash: false
        });
      });
      item.addEventListener(
        'touchstart',
        e => {
          this.touchMovement = false;
        },
        { passive: true }
      );
      item.addEventListener(
        'touchmove',
        e => {
          this.touchMovement = true;
        },
        { passive: true }
      );
      item.addEventListener(
        'touchend',
        e => {
          if (!this.touchMovement) {
            if (e.currentTarget.dataset.itemhash) {
              this.setState({
                hash: parseInt(e.currentTarget.dataset.itemhash, 10)
              });
            }
          }
        },
        { passive: true }
      );
    });
  };

  componentDidUpdate(prevProps) {
    if (prevProps !== this.props) {
      this.setState({
        hash: false
      });
      this.bindings();
    }

    if (this.state.hash) {
      this.tooltip.current.addEventListener('touchstart', e => {
        this.touchMovement = false;
      }),
        { passive: true };
      this.tooltip.current.addEventListener(
        'touchmove',
        e => {
          this.touchMovement = true;
        },
        { passive: true }
      );
      this.tooltip.current.addEventListener('touchend', e => {
        e.preventDefault();
        if (!this.touchMovement) {
          this.setState({
            hash: false
          });
        }
      });
    }
  }

  componentDidMount() {
    window.addEventListener('mousemove', this.mouseMove);

    this.bindings();
  }

  componentWillUnmount() {
    window.removeEventListener('mousemove', this.mouseMove);
  }

  render() {
    let manifest = this.props.manifest;
    if (this.state.hash) {
      let item;
      if (this.state.hash === 343) {
        item = {
          redacted: true
        };
      } else {
        item = manifest.DestinyInventoryItemDefinition[this.state.hash];
      }

      if (item.redacted) {
        return (
          <div id='tooltip' ref={this.tooltip}>
            <div className='acrylic' />
            <div className='frame common'>
              <div className='header'>
                <div className='name'>Classified</div>
                <div>
                  <div className='kind'>Insufficient clearance</div>
                </div>
              </div>
              <div className='black'>
                <div className='description'>
                  <pre>Keep it clean.</pre>
                </div>
              </div>
            </div>
          </div>
        );
      }

      let kind;
      let tier;
      let render;

      switch (item.itemType) {
        case 3:
          kind = 'weapon';
          render = weapon(manifest, item);
          break;
        case 2:
          kind = 'armour';
          render = armour(manifest, item);
          break;
        case 14:
          kind = 'emblem';
          render = emblem(manifest, item);
          break;
        case 26:
          kind = 'bounty';
          render = bounty(manifest, item);
          break;
        case 19:
          if (item.inventory.bucketTypeHash === 1469714392) {
            kind = 'perk';
            render = perk(manifest, item);
            break;
          }
          kind = 'mod';
          render = mod(manifest, item);
          break;
        default:
          kind = '';
          render = fallback(manifest, item);
      }

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

      if (kind === 'perk') {
        tier = 'ui';
      }

      return (
        <div id='tooltip' ref={this.tooltip}>
          <div className='acrylic' />
          <div className={cx('frame', kind, tier)}>
            <div className='header'>
              <div className='name'>{item.displayProperties.name}</div>
              <div>
                <div className='kind'>{item.itemTypeDisplayName}</div>
                {kind !== 'perk' ? <div className='rarity'>{item.inventory.tierTypeName}</div> : null}
              </div>
            </div>
            <div className='black'>{render}</div>
          </div>
        </div>
      );
    } else {
      return null;
    }
  }
}

export default Tooltip;
