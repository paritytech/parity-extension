// Copyright 2015-2017 Parity Technologies (UK) Ltd.
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
import { bind } from 'decko';

import Augmentor from '../../content/augmentor';

import AccountCard from '../../content/components/accountCard';

import styles from './extractions.css';

class Account extends Component {

  state = {
    badges: [],
    small: true,
    tokens: []
  };

  componentWillMount () {
    const { badges, tokens } = this.props.account;

    return Augmentor.fetchImages({ badges, tokens })
      .then(([ badges, tokens ]) => {
        this.setState({ badges, tokens });
      });
  }

  render () {
    const { account } = this.props;
    const { badges, small, tokens } = this.state;
    const { address, email, name, size } = account;

    return (
      <div
        className={ styles.accountCard }
        onClick={ this.toggle }
      >
        <AccountCard
          address={ address }
          badges={ badges }
          email={ email }
          key={ address }
          name={ name }
          safe
          size={ size }
          small={ small }
          tokens={ tokens }
        />
      </div>
    );
  }

  @bind
  toggle () {
    const { small } = this.state;

    this.setState({ small: !small });
  }

}

export default class Extractions extends Component {

  render () {
    const { extractions } = this.props;

    if (!extractions || extractions.length === 0) {
      return (
        <p>No accounts have been extracted</p>
      );
    }

    return (
      <div className={ styles.extractions }>
        { this.renderDesc(extractions.length) }
        <div className={ styles.accounts }>
          { this.renderAccounts(extractions) }
        </div>
      </div>
    );
  }

  renderDesc (n) {
    if (n > 1) {
      return (
        <p>{ n } accounts have been extracted</p>
      );
    }

    return (
      <p>{ n } account has been extracted</p>
    );
  }

  renderAccounts (accounts) {
    return accounts.map((account) => {
      return (
        <Account account={ account } />
      );
    });
  }

}
