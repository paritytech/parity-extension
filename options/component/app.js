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
import { Button, CheckBox, Switch, TextField } from 'preact-mdl';

import Config, { DEFAULT_CONFIG } from '../../background/config';
import { clearCache } from '../../shared';

import 'material-design-lite/material.css';
import 'material-design-lite/material';

import styles from './app.css';

export default class App extends Component {

  state = {
    augmentationEnabled: true,
    DAPPS: '',
    integrationEnabled: true,
    isPristine: true,
    lookupURL: '',
    savedConf: {},
    showAdvanced: false,
    UI: ''
  };

  componentWillMount () {
    Config.get()
      .then((config) => {
        const { augmentationEnabled, DAPPS, integrationEnabled, lookupURL, UI } = config;
        const conf = { augmentationEnabled, DAPPS, integrationEnabled, lookupURL, UI };

        this.setState({ ...conf, savedConf: conf });
      });
  }

  render () {
    const { augmentationEnabled, integrationEnabled, isPristine, showAdvanced } = this.state;

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

        <br />

        <div className={ styles.option }>
          <div className={ styles.checkbox }>
            <CheckBox
              checked={ showAdvanced }
              className={ styles.check }
              onChange={ this.handleToggleAdvanced }
            />
          </div>
          <div>
            Show Advanced Options
          </div>
        </div>

        { showAdvanced ? this.renderAdvancedOptions() : null }

        <div className={ styles.buttons }>
          <Button
            disabled={ isPristine }
            onClick={ this.handleSave }
            primary
          >
            SAVE
          </Button>

          { showAdvanced ? this.renderAdvancedButtons() : null }
        </div>
      </div>
    );
  }

  renderAdvancedButtons () {
    return (
      <div className={ styles.buttons }>
        <Button onClick={ this.handleReset }>
            DEFAULT
          </Button>
        <Button accent onClick={ this.handleClearCache }>
          CLEAR CACHE
        </Button>
      </div>
    );
  }

  renderAdvancedOptions () {
    const { DAPPS, lookupURL, UI } = this.state;

    return (
      <div className={ styles.advanced }>
        <div className={ [ styles.option, styles.optionInput ].join(' ') }>
          <div className={ styles.input }>
            <TextField
              floating-label
              label='Parity local node'
              onChange={ this.handleChangeURL }
              value={ UI }
            />
          </div>
        </div>

        <div className={ [ styles.option, styles.optionInput ].join(' ') }>
          <div className={ styles.input }>
            <TextField
              floating-label
              label='Parity dapps'
              onChange={ this.handleChangeDappsURL }
              value={ DAPPS }
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
      </div>
    );
  }

  saveState (partialNextConf) {
    const { augmentationEnabled, DAPPS, integrationEnabled, lookupURL, savedConf, UI } = this.state;
    const prevConf = { augmentationEnabled, DAPPS, integrationEnabled, lookupURL, UI };
    const nextConf = {
      ...prevConf,
      ...partialNextConf
    };

    const isPristine = isEqual(savedConf, nextConf);

    this.setState({ ...partialNextConf, isPristine });
  }

  @bind
  handleToggleAdvanced () {
    this.setState({ showAdvanced: !this.state.showAdvanced });
  }

  @bind
  handleSave () {
    const { augmentationEnabled, DAPPS, integrationEnabled, lookupURL, UI } = this.state;
    const conf = { augmentationEnabled, DAPPS, integrationEnabled, lookupURL, UI };

    Config.set(conf);
    this.setState({ isPristine: true, savedConf: conf });
  }

  @bind
  handleReset () {
    const { augmentationEnabled, DAPPS, integrationEnabled, lookupURL, UI } = DEFAULT_CONFIG;

    this.saveState({
      augmentationEnabled, DAPPS, integrationEnabled, lookupURL, UI
    });
  }

  @bind
  handleClearCache () {
    clearCache();
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

    this.saveState({ UI: value });
  }

  @bind
  handleChangeDappsURL (event) {
    const { value } = event.target;

    this.saveState({ DAPPS: value });
  }

  @bind
  handleChangeLookupURL (event) {
    const { value } = event.target;

    this.saveState({ lookupURL: value });
  }

}
