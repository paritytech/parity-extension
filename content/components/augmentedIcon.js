// Copyright 2015, 2016 Parity Technologies (UK) Ltd.
// This file is part of Parity.

// Parity is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// Parity is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with Parity.  If not, see <http://www.gnu.org/licenses/>.

import { bind } from 'decko';
import { debounce } from 'lodash';
import { h, Component } from 'preact';
import Portal from 'preact-portal';
/** @jsx h */

import AccountCard from './accountCard';
import Badge from './badge';
import IdentityIcon from './identityIcon';

import styles from './augmentedIcon.css';

const SCALE = 1.5;
const OFFSET = 5;
const MARGIN = 5 / SCALE;

// Twice the badges margin (left + right)
const PADDING = 6;

export default class AugmentedIcon extends Component {

  state = {
    badgesStyle: {},
    containerStyle: {},
    hover: false,
    open: false
  };

  componentDidMount () {
    setTimeout(() => {
      this.setBadgesStyle();
    }, 250);
  }

  constructor (props) {
    super(props);
    this.setHover = debounce(this._setHover, 40, { leading: true });
  }

  render () {
    const { address, badges, height, name, tokens } = this.props;
    const { badgesStyle, containerStyle, hover, open } = this.state;

    const iconClasses = [ styles.iconContainer ];
    const containerClasses = [ styles.icons ];

    if (hover) {
      iconClasses.push(styles.hover);
      containerClasses.push(styles.hover);
    }

    if (open) {
      containerClasses.push(styles.open);
    }

    return (
      <span
        className={ iconClasses.join(' ') }
        onClick={ this.handleClick }
        onMousemove={ this.handleMousemove }
        style={ { height: height, width: height } }
      >
        <IdentityIcon
          address={ address }
          ref={ this.handleIconRef }
          size={ height }
        />

        <Portal into='body'>
          <div
            className={ containerClasses.join(' ') }
            onClick={ this.handleClick }
            style={ containerStyle }
          >
            <span
              className={ styles.badgesContainer }
              style={ { height: height, width: height } }
            >
              <Badges
                badges={ badges }
                ref={ this.handleBadgesRef }
                size={ height }
                show={ hover }
                style={ badgesStyle }
              />
            </span>

            <AccountCard
              address={ address }
              badges={ badges }
              name={ name }
              open={ open }
              size={ height }
              tokens={ tokens }

              onClose={ this.handleClose }
            />
          </div>
        </Portal>
      </span>
    );
  }

  getBadgesPosition (hover) {
    const { iconElement } = this.state;
    if (!iconElement || !this.badgesElement) {
      return 'center';
    }

    const iconRect = iconElement.base.getBoundingClientRect();
    const { top, left } = iconRect;
    const { width, height } = this.badgesElement.base.getBoundingClientRect();
    const scaled = {
      height: height * SCALE,
      width: width * SCALE
    };

    let position = 'top';

    if (top - MARGIN - scaled.height - OFFSET < 0) {
      position = 'bottom';
    }

    if (left + width + MARGIN + scaled.width / 2 + OFFSET >= window.innerWidth) {
      position = 'left';
    }

    if (left - MARGIN - scaled.width - OFFSET < 0) {
      position = 'right';
    }

    if (!hover) {
      if (position === 'right') {
        return 'center-right';
      }

      if (position === 'left') {
        return 'center-left';
      }

      return 'center';
    }

    return position;
  }

  getBadgesStyle (position) {
    const { iconElement } = this.state;
    const N = this.props.badges.length;

    if (!iconElement || !this.badgesElement) {
      return {};
    }

    const iconRect = iconElement.base.getBoundingClientRect();

    const width = N * iconRect.width + PADDING * (N - 1);
    const height = iconRect.height;

    const X = ((N - 1) * (iconRect.width + PADDING)) / 2 / SCALE;

    switch (position) {
      case 'top':
        return { transform: `scale(${SCALE}) translateX(-${X}px) translateY(-${height}px)` };

      case 'bottom':
        return { transform: `scale(${SCALE}) translateX(-${X}px) translateY(${height}px)` };

      case 'left':
        return { transform: `scale(${SCALE}) translateX(-${width + MARGIN - (PADDING * (N - 1))}px) translateY(0)` };

      case 'right':
        return { transform: `scale(${SCALE}) translateX(${iconRect.width + MARGIN}px) translateY(0)` };

      case 'center':
        return { transform: `scale(1) translateX(-${X}px) translateY(0px)` };

      case 'center-right':
        return { transform: `scale(1) translateX(0) translateY(0px)` };

      case 'center-left':
        return { transform: `scale(1) translateX(-${width - (PADDING * (N - 2)) - iconRect.width}px) translateY(0px)` };

      default:
        return {};
    }
  }

  setBadgesStyle (hover = this.state.hover) {
    const position = this.getBadgesPosition(hover);
    const style = this.getBadgesStyle(position);

    this.setState({ badgesStyle: style });
  }

  @bind
  handleClick (event) {
    const { open } = this.state;

    event.preventDefault();
    event.stopPropagation();

    if (!open) {
      return this.handleOpen();
    }

    return this.handleClose();
  }

  @bind
  handleClose () {
    const selectedText = window.getSelection().toString();

    // Don't close if text is selected
    if (selectedText) {
      return false;
    }

    this.setState({ open: false });
  }

  @bind
  handleMousemove (event) {
    const { height } = this.props;
    const { iconElement } = this.state;

    const { clientX, clientY } = event;
    const { top, left } = iconElement.base.getBoundingClientRect();

    const inH = (clientX >= left && clientX <= (left + height));
    const inV = (clientY >= top && clientY <= (top + height));

    if (inH && inV) {
      if (!this.state.hover) {
        document.body.addEventListener('mousemove', this.handleMousemove);
        return this.setHover(true);
      }

      return;
    }

    if (this.state.hover) {
      document.body.removeEventListener('mousemove', this.handleMousemove);
      return this.setHover(false);
    }
  }

  @bind
  handleOpen () {
    this.setState({ open: true });
    this._setHover(false);
  }

  @bind
  handleBadgesRef (element) {
    this.badgesElement = element;
  }

  @bind
  handleIconRef (element) {
    if (!this.state.iconElement) {
      const nextState = { iconElement: element };

      this.setState(nextState);
      this.positionContainer(nextState);
    }
  }

  @bind
  _setHover (hover) {
    if (this.state.hover !== hover) {
      if (hover) {
        this.positionContainer();
      }

      this.setBadgesStyle(hover);
      this.setState({ hover });
    }
  }

  positionContainer (state = this.state) {
    const { iconElement } = state;

    if (!iconElement) {
      return;
    }

    const bodyRect = document.body.getBoundingClientRect();
    const elemRect = iconElement.base.getBoundingClientRect();

    const nextStyle = {
      top: elemRect.top - bodyRect.top + elemRect.height,
      left: elemRect.left - bodyRect.left + elemRect.width / 2
    };

    this.setState({ containerStyle: nextStyle });
  }

}

class Badges extends Component {

  state = {
    show: this.props.show
  };

  componentWillReceiveProps (nextProps) {
    if (this.props.show !== nextProps.show) {
      this.handleToggleShow(nextProps.show);
    }
  }

  render () {
    const { badges, size, style = {} } = this.props;
    const { show } = this.state;

    const classes = [ styles.badges ];

    if (show) {
      classes.push(styles.hover);
    }

    return (
      <span
        className={ classes.join(' ') }
        style={ style }
      >
        { this.renderBadges(badges, size) }
      </span>
    );
  }

  renderBadges (badges, size) {
    return badges.map((badge) => {
      const { address, title, src } = badge;

      return (
        <Badge
          key={ address }
          size={ size }
          src={ src }
          title={ title }
        />
      );
    });
  }

  @bind
  handleToggleShow (show) {
    this.setState({ show });
  }

}
