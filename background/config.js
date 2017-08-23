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

import { isEqual } from 'lodash';
import uuid from 'uuid/v1';

import { reload, withDomain, isProd, browser } from '../shared';

const CONFIG_KEY = 'parity::config';

export const DEFAULT_CONFIG = {
  analyticsEnabled: true,
  augmentationEnabled: !isProd,
  // TODO [ToDr] Deprecate if 1.7 == stable
  DAPPS: 'http://127.0.0.1:8080',
  integrationEnabled: true,
  lookupURL: 'https://id.parity.io',
  UI: 'http://127.0.0.1:8180',
  lastVersion: 'unknown',
  lastChain: 'unknown',
  clientId: uuid()
};

export default class Config {
  static set (data) {
    return Config.get()
      .then((config) => {
        const prevConfig = {
          ...DEFAULT_CONFIG,
          ...config
        };

        const nextConfig = {
          ...prevConfig,
          ...data
        };

        if (config.lookupURL) {
          nextConfig.lookupURL = nextConfig.lookupURL.replace(/\/+$/, '');
        }

        if (!isEqual(prevConfig, nextConfig)) {
          reload();
        }

        return new Promise((resolve) => {
          browser.storage.local.set({
            [ CONFIG_KEY ]: nextConfig
          }, () => {
            resolve();
          });
        });
      });
  }

  static get () {
    return new Promise((resolve) => {
      browser.storage.local.get(CONFIG_KEY, (data = {}) => {
        const config = data[CONFIG_KEY] || {};
        const mergedConfig = {
          ...DEFAULT_CONFIG,
          ...config
        };
        mergedConfig.UI = withDomain(mergedConfig.UI);
        mergedConfig.DAPPS = withDomain(mergedConfig.DAPPS);
        mergedConfig.lookupURL = withDomain(mergedConfig.lookupURL, 'https://', 'http://');

        resolve(mergedConfig);
      });
    });
  }
}

Config.get()
  .then(config => {
    // make sure to save the clientId (if using default one)
    Config.set({ clientId: config.clientId });
  });
