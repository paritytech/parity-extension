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

import { reload } from '../shared';

const CONFIG_KEY = 'parity::config';

export const DEFAULT_CONFIG = {
  augmentationEnabled: process.env.NODE_ENV !== 'production',
  DAPPS: '127.0.0.1:8080',
  integrationEnabled: true,
  lookupURL: 'https://id.parity.io',
  UI: '127.0.0.1:8180'
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
          chrome.storage.local.set({
            [ CONFIG_KEY ]: nextConfig
          }, () => {
            resolve();
          });
        });
      });
  }

  static get () {
    return new Promise((resolve) => {
      chrome.storage.local.get(CONFIG_KEY, (data = {}) => {
        const config = data[CONFIG_KEY] || {};

        resolve({
          ...DEFAULT_CONFIG,
          ...config
        });
      });
    });
  }

}
