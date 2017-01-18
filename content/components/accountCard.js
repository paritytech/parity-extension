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
import { noop } from 'lodash';
import { h, Component } from 'preact';
/** @jsx h */

import IdentityIcon from './identityIcon';
import Token from './token';

import styles from './accountCard.less';

export default class AccountCard extends Component {

  clickTimeout = null;

  state = {
    open: false
  };

  componentWillReceiveProps (nextProps) {
    if (nextProps.open !== this.props.open) {
      this.handleToggleOpen(nextProps.open);
    }
  }

  render () {
    const { address, badges, name, tokens } = this.props;
    const { open } = this.state;

    const mainClasses = [ styles.card ];

    if (open) {
      mainClasses.push(styles.open);
    }

    return (
      <span className={ mainClasses.join(' ') }>
        <span className={ styles.header }>
          <IdentityIcon
            address={ address }
            size={ 48 }
          />

          <span className={ styles.title }>
            <span className={ styles.name }>
              { name }
            </span>
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

  @bind
  handleToggleOpen (open) {
    this.setState({ open });
  }

}
