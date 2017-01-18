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

import Badge from './badge';

import styles from './token.less';

export default class Token extends Component {

  render () {
    const { badge, balance, name, title } = this.props;
    const { size, src } = badge;

    const nameClasses = [ styles.tla ];

    if (!balance) {
      nameClasses.push(styles['no-value']);
    }

    return (
      <span
        className={ styles.token }
        title={ title }
      >
        <Badge
          size={ size }
          src={ src }
          title={ title }
        />

        <span className={ styles.balance }>
          { this.renderBalance(balance) }

          <span className={ nameClasses.join(' ') }>
            { name }
          </span>
        </span>
      </span>
    );
  }

  renderBalance (balance) {
    if (!balance) {
      return null;
    }

    // Display with 3 decimals
    const value = parseFloat(balance).toFixed(3);

    return (
      <span className={ styles.value }>
        { value }
      </span>
    );
  }

}
