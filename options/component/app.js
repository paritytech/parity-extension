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
import { isEqual } from 'lodash';
import { h, Component } from 'preact';
import { Button, Switch, TextField } from 'preact-mdl';

import Config, { DEFAULT_CONFIG } from '../../background/config';

import 'material-design-lite/material.css';
import 'material-design-lite/material';

import styles from './app.css';

export default class App extends Component {

  state = {
    augmentationEnabled: true,
    integrationEnabled: true,
    isPristine: true,
    lookupURL: '',
    nodeURL: '',
    savedConf: {}
  };

  componentWillMount () {
    Config.get()
      .then((config) => {
        const { augmentationEnabled = true, integrationEnabled = true, lookupURL = '', nodeURL = '' } = config;
        const conf = { augmentationEnabled, integrationEnabled, lookupURL, nodeURL };

        this.setState({ ...conf, savedConf: conf });
      });
  }

  render () {
    const { augmentationEnabled, integrationEnabled, isPristine, lookupURL, nodeURL } = this.state;

    return (
      <div className={ styles.options }>
        <p>
          Integrate the Parity Ethereum client with the Chrome browser
        </p>

        <div className={ styles.option }>
          <div className={ styles.switch }>
            <Switch
              checked={ integrationEnabled }
              className={ styles.check }
              onChange={ this.handleToggleIntegration }
            />
          </div>
          <div>
            Web3 Integration
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

        <div className={ [ styles.option, styles.optionInput ].join(' ') }>
          <div className={ styles.input }>
            <TextField
              floating-label
              label='Parity node URL'
              onChange={ this.handleChangeURL }
              value={ nodeURL }
            />
          </div>
        </div>

        <div className={ [ styles.option, styles.optionInput ].join(' ') }>
          <div className={ styles.input }>
            <TextField
              floating-label
              label='Lookup service URL (fallback)'
              onChange={ this.handleChangeLookupURL }
              value={ lookupURL }
            />
          </div>
        </div>

        <div>
          <Button
            disabled={ isPristine }
            onClick={ this.handleSave }
          >
            SAVE
          </Button>

          <Button onClick={ this.handleReset }>
            RESET
          </Button>
        </div>
      </div>
    );
  }

  saveState (partialNextConf) {
    const { augmentationEnabled, integrationEnabled, lookupURL, nodeURL, savedConf } = this.state;
    const prevConf = { augmentationEnabled, integrationEnabled, lookupURL, nodeURL };
    const nextConf = {
      ...prevConf,
      ...partialNextConf
    };

    const isPristine = isEqual(savedConf, nextConf);

    this.setState({ ...partialNextConf, isPristine });
  }

  @bind
  handleSave () {
    const { augmentationEnabled, integrationEnabled, lookupURL, nodeURL } = this.state;
    const conf = { augmentationEnabled, integrationEnabled, lookupURL, nodeURL };

    Config.set(conf);
    this.setState({ isPristine: true, savedConf: conf });
  }

  @bind
  handleReset () {
    const { augmentationEnabled, integrationEnabled, lookupURL, nodeURL } = DEFAULT_CONFIG;

    this.saveState({
      augmentationEnabled, integrationEnabled, lookupURL, nodeURL
    });
  }

  @bind
  handleToggleAugmentation (event) {
    const { checked } = event.target;

    this.saveState({ augmentationEnabled: checked });
  }

  @bind
  handleToggleIntegration (event) {
    const { checked } = event.target;

    this.saveState({ integrationEnabled: checked });
  }

  @bind
  handleChangeURL (event) {
    const { value } = event.target;

    this.saveState({ nodeURL: value });
  }

  @bind
  handleChangeLookupURL (event) {
    const { value } = event.target;

    this.saveState({ lookupURL: value });
  }

}
