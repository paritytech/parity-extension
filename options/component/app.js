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

import classnames from 'classnames';
import { bind } from 'decko';
import { isEqual } from 'lodash';
import { h, Component } from 'preact';
import { Button, CheckBox, Switch, TextField } from 'preact-mdl';

import Config, { DEFAULT_CONFIG } from '../../background/config';
import { clearCache, withDomain } from '../../shared';

import 'material-design-lite/material.css';
import 'material-design-lite/material';

import styles from './app.css';

const isProd = process.env.NODE_ENV === 'production';

export default class App extends Component {

  state = {
    analyticsEnabled: DEFAULT_CONFIG.analyticsEnabled,
    augmentationEnabled: DEFAULT_CONFIG.augmentationEnabled,
    integrationEnabled: DEFAULT_CONFIG.integrationEnabled,
    isPristine: true,
    lookupURL: '',
    savedConf: {},
    statuses: {},
    showAdvanced: false,
    // TODO [ToDr] Deprecate when 1.7 === stable
    DAPPS: '',
    UI: ''
  };

  filterConfig (config) {
    const {
      analyticsEnabled,
      augmentationEnabled,
      integrationEnabled,
      lookupURL,
      DAPPS,
      UI
    } = config;

    return {
      analyticsEnabled,
      augmentationEnabled,
      integrationEnabled,
      lookupURL,
      DAPPS,
      UI
    };
  }

  componentWillMount () {
    Config.get()
      .then((config) => {
        const conf = this.filterConfig(config);
        this.setState({ ...conf, savedConf: conf }, () => this.checkStatuses({}, conf));
      });
  }

  render () {
    const { augmentationEnabled, integrationEnabled, isPristine, showAdvanced, UI, statuses } = this.state;
    const nodeClassName = this.statusClassName(statuses.node);

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
            >
              Web3 Integration
            </Switch>
          </div>
        </div>

        {
          isProd
          ? null
          : (
            <div className={ styles.option }>
              <div className={ styles.switch }>
                <Switch
                  checked={ augmentationEnabled }
                  className={ styles.check }
                  onChange={ this.handleToggleAugmentation }
                >
                  Identity Augmentation
                </Switch>
              </div>
            </div>
          )
        }

        { this.renderAnalytics() }

        <div className={ [ styles.option, styles.optionInput ].join(' ') }>
          <div
            className={ nodeClassName }
            title={ statuses.node }
          />
          <div className={ styles.input }>
            <TextField
              floating-label
              label='Parity local node'
              onChange={ this.handleChangeURL }
              value={ UI }
            />
          </div>
        </div>

        <br />

        <div className={ styles.option }>
          <div className={ styles.checkbox }>
            <CheckBox
              checked={ showAdvanced }
              className={ styles.check }
              onChange={ this.handleToggleAdvanced }
            >
              Show Advanced Options
            </CheckBox>
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

  renderAnalytics () {
    const { analyticsEnabled } = this.state;
    const warning = analyticsEnabled ? null : (
      <p>Tracking your activity helps us improve Parity and Parity Extension. Consider enabling the reporting.</p>
    );

    return [
      <div className={ styles.option }>
        <div className={ styles.switch }>
          <Switch
            checked={ analyticsEnabled }
            className={ styles.check }
            onChange={ this.handleToggleAnalytics }
          >
            Allow Analytics Reporting
          </Switch>
        </div>
      </div>,
      warning
    ];
  }

  renderAdvancedButtons () {
    return (
      <div className={ styles.buttons }>
        <Button onClick={ this.handleReset }>
          DEFAULT
        </Button>

        {
          isProd
          ? null
          : (
            <Button accent onClick={ this.handleClearCache }>
              CLEAR CACHE
            </Button>
          )
        }
      </div>
    );
  }

  renderAdvancedOptions () {
    const { DAPPS, lookupURL, statuses } = this.state;

    const dappsClassName = this.statusClassName(statuses.dapps);
    const lookupClassName = this.statusClassName(statuses.lookup);

    return (
      <div className={ styles.advanced }>
        <div className={ [ styles.option, styles.optionInput ].join(' ') }>
          <div
            className={ dappsClassName }
            title={ statuses.dapps }
          />
          <div className={ styles.input }>
            <TextField
              floating-label
              label='Parity Dapps (pre 1.7)'
              onChange={ this.handleChangeDappsURL }
              value={ DAPPS }
            />
          </div>
        </div>

        {
          isProd
          ? null
          : (
            <div className={ [ styles.option, styles.optionInput ].join(' ') }>
              <div
                className={ lookupClassName }
                title={ statuses.lookup }
              />
              <div className={ styles.input }>
                <TextField
                  floating-label
                  label='Lookup service URL (fallback)'
                  onChange={ this.handleChangeLookupURL }
                  value={ lookupURL }
                />
              </div>
            </div>
          )
        }
      </div>
    );
  }

  statusClassName (status) {
    return classnames({
      [ styles.status ]: true,
      [ styles.connected ]: status === 'connected',
      [ styles.connecting ]: status === 'connecting',
      [ styles.disconnected ]: status === 'disconnected'
    });
  }

  checkStatuses (prevConf, nextConf) {
    const promises = [];
    const statuses = {};
    const updateStatus = (prev, next, key) => {
      if (prev === next) {
        return Promise.reject('Not changed');
      }

      statuses[key] = 'connecting';

      const promise = fetch(next, { method: 'HEAD' })
        .then(() => ({ key, status: 'connected' }))
        .catch(() => ({ key, status: 'disconnected' }));

      promises.push(promise);
      return promise;
    };

    updateStatus(prevConf.lookupURL, nextConf.lookupURL, 'lookup');
    updateStatus(prevConf.DAPPS, nextConf.DAPPS, 'dapps');
    updateStatus(prevConf.UI, nextConf.UI, 'node');

    if (!Object.keys(statuses)) {
      return;
    }

    this.setState({ statuses: { ...this.state.statuses, ...statuses } });

    return Promise.all(promises)
      .then((newStatuses) => {
        const prevStatuses = this.state.statuses;
        const nextStatuses = newStatuses.reduce((obj, data) => {
          obj[data.key] = data.status;

          return obj;
        }, {});

        const statuses = {
          ...prevStatuses,
          ...nextStatuses
        };

        this.setState({ statuses });
      });
  }

  saveState (partialNextConf) {
    const { savedConf } = this.state;
    const prevConf = this.filterConfig(this.state);
    const nextConf = {
      ...prevConf,
      ...partialNextConf
    };

    const isPristine = isEqual(savedConf, nextConf);

    this.setState({ ...partialNextConf, isPristine }, () => this.checkStatuses(prevConf, nextConf));
  }

  @bind
  handleToggleAdvanced () {
    if (!this.state.showAdvanced && Object.keys(this.state.statuses).length === 0) {
      this.checkStatuses({}, this.state);
    }

    this.setState({ showAdvanced: !this.state.showAdvanced });
  }

  @bind
  handleSave () {
    const conf = this.filterConfig(this.state);

    Config.set(conf);
    this.setState({ isPristine: true, savedConf: conf });
  }

  @bind
  handleReset () {
    const conf = this.filterConfig(DEFAULT_CONFIG);

    this.saveState(conf);
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
  handleToggleAnalytics (event) {
    const { checked } = event.target;

    this.saveState({ analyticsEnabled: checked });
  }

  @bind
  handleToggleIntegration (event) {
    const { checked } = event.target;

    this.saveState({ integrationEnabled: checked });
  }

  @bind
  handleChangeURL (event) {
    const { value } = event.target;

    this.saveState({ UI: withDomain(value) });
  }

  @bind
  handleChangeDappsURL (event) {
    const { value } = event.target;

    this.saveState({ DAPPS: value });
  }

  @bind
  handleChangeLookupURL (event) {
    const { value } = event.target;

    this.saveState({ lookupURL: withDomain(value, 'https://', 'http://') });
  }
}
