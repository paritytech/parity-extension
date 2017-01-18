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
/** @jsx h */

import AccountCard from './accountCard';
import Badge from './badge';
import IdentityIcon from './identityIcon';

import styles from './augmentedIcon.less';

const ICON_CONTAINER_SCALE = 4;

export default class AugmentedIcon extends Component {

  state = {
    hover: false,
    open: false
  };

  constructor (props) {
    super(props);
    this.setHover = debounce(this._setHover, 40, { leading: true });
  }

  render () {
    const { address, badges, height, name, tokens } = this.props;
    const { hover, open } = this.state;

    return (
      <span
        className={ styles.icons }
        onClick={ this.handleClick }
      >
        <span
          className={ styles.iconContainer }
          onMousemove={ this.handleMousemove }
          style={ { height: height, width: height } }
        >
          <IdentityIcon
            address={ address }
            ref={ this.handleRef }
            size={ height }
          />
        </span>

        <Badges
          badges={ badges }
          size={ height }
          show={ hover }
        />

        <AccountCard
          address={ address }
          badges={ badges }
          name={ name }
          open={ open }
          tokens={ tokens }

          onClose={ this.handleClose }
        />
      </span>
    );
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
    const { clientX, clientY } = event;
    const { top, left } = this.iconElement.base.getBoundingClientRect();

    const inH = (clientX >= left && clientX <= (left + height));
    const inV = (clientY >= top && clientY <= (top + height));

    if (inH && inV) {
      if (!this.state.hover) {
        document.body.addEventListener('mousemove', this.handleMousemove);
        return this.setHover(true);
      }
    } else if (this.state.hover) {
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
  handleRef (element) {
    this.iconElement = element;
  }

  @bind
  _setHover (hover) {
    if (this.state.hover !== hover) {
      this.setState({ hover });
    }
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
    const { badges, size } = this.props;
    const { show } = this.state;

    const classes = [ styles.badges ];

    if (show) {
      classes.push(styles.hover);
    }

    return (
      <span className={ classes.join(' ') }>
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
