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

import { noop } from 'lodash';
import { h, Component } from 'preact';
/** @jsx h */

import Badge from './badge';
import IdentityIcon from './identityIcon';

import styles from '../styles.less';

export default class AccountCard extends Component {
  clickTimeout = null;

  render () {
    const { address, badges, name, tokens } = this.props;

    return (
      <span className={ styles.card }>
        <span className={ styles.header }>
          <IdentityIcon
            address={ address }
            height={ 48 }
          />

          <span className={ styles.title }>
            <span className={ styles.name }>{ name }</span>
            { this.renderAddress(address) }
          </span>
        </span>

        <span className={ styles.tokens }>
          { this.renderTokens(tokens) }
        </span>

        <span className={ styles.tokens }>
          { this.renderBadges(badges) }
        </span>
      </span>
    );
  }

  renderAddress (address) {
    return (
      <span
        className={ styles.address }
        onClick={ this.handleClick }
        onDblclick={ this.handleDblclick }
        title={ address }
      >
        { address }
      </span>
    );
  }

  renderTokens (tokens) {
    return tokens.map((token) => {
      const { balance, title, TLA, src } = token;

      return (
        <Token
          badge={ { src, height: 32 } }
          balance={ balance }
          key={ TLA }
          name={ TLA }
          title={ title }
        />
      );
    });
  }

  renderBadges (badges) {
    return badges.map((badge) => {
      const { address, title, src } = badge;

      return (
        <Token
          badge={ { src, height: 24 } }
          key={ address }
          name={ title }
          title={ title }
        />
      );
    });
  }

  clearClick () {
    if (this.clickTimeout) {
      window.clearTimeout(this.clickTimeout);
      this.clickTimeout = null;
    }
  }

  handleClick = (event) => {
    const { onClose = noop } = this.props;

    this.clearClick();
    event.preventDefault();
    event.stopPropagation();

    this.clickTimeout = window.setTimeout(() => {
      onClose();
    }, 200);

    return false;
  }

  handleDblclick = (event) => {
    this.clearClick();
    return event;
  }
}

class Token extends Component {
  render () {
    const { badge, balance, name, title } = this.props;
    const { height, src } = badge;

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
          height={ height }
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
