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

import { bind } from 'decko';
import { h, Component } from 'preact';
import { CheckBox } from 'preact-mdl';

import 'material-design-lite/material.css';
import 'material-design-lite/material';

import Config from '../../background/config';

import styles from './app.css';

export default class App extends Component {

  state = {
    enabled: true
  };

  componentWillMount () {
    Config.get()
      .then((config) => {
        const { enabled = true } = config;

        this.setState({ enabled });
      });
  }

  render () {
    const { enabled } = this.state;

    return (
      <div className={ styles.container }>
        <div className={ styles.header }>
          <h1 className={ styles.title }>Web3 Injection</h1>
          <CheckBox
            checked={ enabled }
            className={ styles.check }
            onChange={ this.handleChange }
          />
        </div>
      </div>
    );
  }

  @bind
  handleChange (event) {
    const { checked } = event.target;

    Config.set({ enabled: checked })
      .then(() => {
        this.setState({ enabled: checked });
      });
  }

}
