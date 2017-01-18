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

import { h, Component } from 'preact';
/** @jsx h */

import AccountCard from './account';
import Badge from './badge';
import IdentityIcon from './identityIcon';

import styles from '../styles.less';

export default class AugmentedIcon extends Component {
  render () {
    const { address, badges, height, tokens } = this.props;

    return (
      <span className={ styles.container }>
        <span
          className={ styles.icons }
          onClick={ this.handleClick }
        >
          <IdentityIcon
            address={ address }
            height={ height }
          />

          <span className={ styles.badges }>
            { this.renderBadges(badges, height) }
          </span>

          <AccountCard
            address={ address }
            badges={ badges }
            name={ name }
            tokens={ tokens }

            onClose={ this.handleClose }
          />
        </span>
      </span>
    );
  }

  renderBadges (badges, height) {
    return badges.map((badge) => {
      const { address, title, src } = badge;

      return (
        <Badge
          height={ height }
          key={ address }
          src={ src }
          title={ title }
        />
      );
    });
  }

  handleClick = (event) => {
    event.preventDefault();
    event.stopPropagation();

    const { currentTarget } = event;

    const selectedText = window.getSelection().toString();

    // Don't close if text is selected
    if (selectedText) {
      return false;
    }

    const classes = currentTarget.className.split(' ').map((className) => className.trim());

    if (classes.includes(styles.expanded)) {
      currentTarget.className = classes.filter((className) => className !== styles.expanded).join(' ');
    } else {
      currentTarget.className = classes.concat(styles.expanded).join(' ');
    }
  }

  handleOpen = () => {
    console.log('open');
  }

  handleClose = () => {
    console.log('close');
  }
}
