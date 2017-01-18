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
import { h, Component } from 'preact';
/** @jsx h */

import AccountCard from './accountCard';
import Badge from './badge';
import IdentityIcon from './identityIcon';

import styles from './augmentedIcon.less';

export default class AugmentedIcon extends Component {

  state = {
    open: false
  };

  render () {
    const { address, badges, height, name, tokens } = this.props;
    const { open } = this.state;

    return (
      <span
        className={ styles.icons }
        onClick={ this.handleClick }
      >
        <IdentityIcon
          address={ address }
          size={ height }
        />

        <span className={ styles.badges }>
          { this.renderBadges(badges, height) }
        </span>

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
  handleOpen () {
    this.setState({ open: true });
  }

}
