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
import { noop } from 'lodash';
import { h, Component } from 'preact';

import IdentityIcon from './identityIcon';
import Token from './token';

import styles from './accountCard.css';

export default class AccountCard extends Component {

  clickTimeout = null;

  render () {
    const { address, badges, className, email, name, safe, small, tokens } = this.props;

    return (
      <span
        className={ [ styles.card, className ].join(' ') }
      >
        <span className={ styles.header }>
          <IdentityIcon
            address={ address }
            size={ 44 }
          />

          <span className={ styles.title }>
            <span className={ styles.name }>
              { name || email }
            </span>
            { this.renderAddress(address) }
          </span>
        </span>

        { this.renderContent(badges, name, safe, small, tokens) }
      </span>
    );
  }

  renderContent (badges, name, safe, small, tokens) {
    const className = classnames({
      [ styles.content ]: true,
      [ styles.small ]: small
    });

    return (
      <span className={ className }>
        { this.renderWarning(safe, name) }

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
    return tokens
      .sort((tokenA, tokenB) => {
        if (tokenA.TLA.toLowerCase() === 'eth') {
          return -1;
        }

        if (tokenB.TLA.toLowerCase() === 'eth') {
          return 1;
        }

        return tokenA.TLA.localeCompare(tokenB.TLA);
      })
      .map((token) => {
        const { balance, title, TLA, src } = token;

        return (
          <Token
            badge={ { src, size: 32 } }
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
          badge={ { src, size: 24 } }
          key={ address }
          name={ title }
          title={ title }
        />
      );
    });
  }

  renderWarning (safe, name) {
    if (safe) {
      return null;
    }

    return (
      <p className={ styles.warning }>
        This account has been matched against the
        Registry record <code>{ name }</code>.
        It has not been verified and could be a false positive.
      </p>
    );
  }

  clearClick () {
    if (this.clickTimeout) {
      window.clearTimeout(this.clickTimeout);
      this.clickTimeout = null;
    }
  }

  @bind
  handleClick (event) {
    const { onClose = noop } = this.props;

    this.clearClick();
    event.preventDefault();
    event.stopPropagation();

    this.clickTimeout = window.setTimeout(() => {
      onClose();
    }, 200);

    return false;
  }

  @bind
  handleDblclick (event) {
    this.clearClick();
    return event;
  }

}
