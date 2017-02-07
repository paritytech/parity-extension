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
import { Switch } from 'preact-mdl';

import Config from '../../background/config';

import 'material-design-lite/material.css';
import 'material-design-lite/material';

import styles from './app.css';

export default class App extends Component {

  state = {
    augmentationEnabled: true,
    integrationEnabled: true
  };

  componentWillMount () {
    Config.get()
      .then((config) => {
        const { augmentationEnabled = true, integrationEnabled = true } = config;

        this.setState({ augmentationEnabled, integrationEnabled });
      });
  }

  render () {
    const { augmentationEnabled, integrationEnabled } = this.state;

    return (
      <div className={ styles.options }>
        <div className={ styles.option }>
          <div className={ styles.switch }>
            <Switch
              checked={ integrationEnabled }
              className={ styles.check }
              onChange={ this.handleToggleIntegration }
            />
          </div>
          <div>
            Parity Integration
          </div>
        </div>

        <div className={ styles.option }>
          <div className={ styles.switch }>
            <Switch
              checked={ augmentationEnabled }
              className={ styles.check }
              onChange={ this.handleToggleAugmentation }
            />
          </div>
          <div>
            Identity Augmentation
          </div>
        </div>
      </div>
    );
  }

  @bind
  handleToggleAugmentation (event) {
    const { checked } = event.target;

    Config.set({ augmentationEnabled: checked })
      .then(() => {
        this.setState({ augmentationEnabled: checked });
      });
  }

  @bind
  handleToggleIntegration (event) {
    const { checked } = event.target;

    Config.set({ integrationEnabled: checked })
      .then(() => {
        this.setState({ integrationEnabled: checked });
      });
  }

}
