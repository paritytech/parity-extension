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

import classnames from 'classnames';
import { bind } from 'decko';
import { h, Component } from 'preact';

import { positionToStyle } from '../util/style';

import styles from './popup.css';

const DEFAULT_SCALE = 0.05;

export default class Popup extends Component {
  state = {
    open: this.props.open,
    position: {},
    style: {}
  };

  componentWillMount () {
    this.handleToggleOpen(false);
  }

  componentWillReceiveProps (nextProps) {
    if (!this.props.origin && nextProps.origin) {
      this.center(nextProps);
    }

    if (nextProps.open !== this.props.open) {
      this.handleToggleOpen(nextProps.open);
    }
  }

  render () {
    const { children, size } = this.props;
    const { open, style } = this.state;

    const className = classnames({
      [styles.card]: true,
      [styles.open]: open
    });

    const containerStyle = {
      ...style,
      top: size / 2,
      left: size / 2
    };

    return (
      <span
        className={ className }
        ref={ this.handleRef }
        style={ containerStyle }
      >
        { children }
      </span>
    );
  }

  @bind
  handleRef (element) {
    if (this.state.containerElement) {
      return;
    }

    this.setState({ containerElement: element }, this.center);
  }

  @bind
  handleToggleOpen (open) {
    const { position } = this.state;

    if (!open) {
      const style = positionToStyle({ scale: DEFAULT_SCALE, position });
      return this.setState({ open, style });
    }

    const nextPosition = getPosition(this.state.containerElement, 1 / DEFAULT_SCALE, position);
    const style = positionToStyle({ scale: 1, position: nextPosition });
    return this.setState({ open, position: nextPosition, style });
  }
}

/**
 * Returns the best position for the given
 * node (with optional future scaling)
 * as an Object { x, y } x for horizontal
 * and y for vertical
 */
function getPosition (node, scale = 1, position = {}) {
  const offset = getOffset(node, scale, position);

  let x = 'center';
  let y = 'center';

  if (offset.top < 0) {
    y = 'bottom';
  }

  if (offset.bottom < 0) {
    y = 'top';
  }

  if (offset.right < 0) {
    x = 'left';
  }

  if (offset.left < 0) {
    x = 'right';
  }

  return { x, y };
}

function getOffset (node, scale = 1, position = {}) {
  const { x = 'center', y = 'center' } = position;
  const { left, top, right, bottom, width, height } = node.getBoundingClientRect();
  const { clientHeight, clientWidth } = document.documentElement;

  const offset = {
    x: 0,
    y: 0
  };

  if (x === 'left') {
    offset.x = -width;
  }

  if (x === 'right') {
    offset.x = width;
  }

  if (y === 'top') {
    offset.y = -height;
  }

  if (y === 'bottom') {
    offset.y = height;
  }

  const center = {
    left: left + width / 2 - offset.x,
    top: top + height / 2 - offset.y,
    right: clientWidth - right + width / 2 + offset.x,
    bottom: clientHeight - bottom + height / 2 + offset.y
  };

  return {
    top: center.top - height / 2 * scale,
    left: center.left - width / 2 * scale,
    right: center.right - width / 2 * scale,
    bottom: center.bottom - height / 2 * scale
  };
}
