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

/* global chrome */

import { keccak_256 as sha3 } from 'js-sha3';
import { omitBy } from 'lodash';
import ParityLookup from 'lookup';

import Config, { DEFAULT_CONFIG } from './config';

const LOOKUP_STORAGE_KEY = 'parity::lookup_cache';

// Time To Live for Lookup data (in ms : 1h for valid response,
// 5 minutes for invalid ones)
const TTLs = {
  success: 1000 * 3600,
  error: 1000 * 60 * 5
};

export default class Lookup {

  _addresses = {};
  _githubs = {};
  _emails = {};
  _names = {};

  currentCacheKey = null;
  lookupURL = DEFAULT_CONFIG.lookupURL;

  store = null;

  constructor (store) {
    this.store = store;

    this.load();
    Config.get()
      .then((config) => {
        if (config.lookupURL) {
          this.lookupURL = config.lookupURL;
        }
      });
  }

  clearCache () {
    this.clean();

    setTimeout(() => {
      chrome.storage.local.remove(LOOKUP_STORAGE_KEY, () => {});
    }, 50);
  }

  getCacheKey () {
    // From local node
    if (this.store.transport.isConnected) {
      return this.store.transport.getNetworkId()
        .then((networkId = -1) => {
          return `node_net::${networkId}`;
        });
    }

    // From Lookup Service
    return Config.get()
      .then((config) => {
        const { lookupURL } = config;
        const hash = sha3(lookupURL);

        return `lookup_url::${hash}`;
      });
  }

  /**
   * Clean the given data by removing all the Promises and
   * all the old data
   */
  clean (data = {}) {
    const {
      addresses = { ...this._addresses },
      githubs = { ...this._githubs },
      emails = { ...this._emails },
      names = { ...this._names }
    } = data;

    const omit = (data) => {
      return data instanceof Promise || (Date.now() > data.expires);
    };

    const cleanData = {
      addresses: omitBy(addresses, omit),
      githubs: omitBy(githubs, omit),
      emails: omitBy(emails, omit),
      names: omitBy(names, omit)
    };

    // Load the saved data, omitting the old data
    this._addresses = cleanData.addresses;
    this._githubs = cleanData.githubs;
    this._emails = cleanData.emails;
    this._names = cleanData.names;

    return cleanData;
  }

  save (data, cacheKey = this.currentCacheKey) {
    setTimeout(() => {
    console.warn('save', cacheKey);
      const cleanData = this.clean(data);

      chrome.storage.local.get(LOOKUP_STORAGE_KEY, (storage = {}) => {
        const cache = storage[LOOKUP_STORAGE_KEY] || {};

        cache[cacheKey] = cleanData;
        chrome.storage.local.set({ [ LOOKUP_STORAGE_KEY ]: cache }, () => {});
      });
    }, 50);
  }

  load () {
    return this.getCacheKey()
      .then((cacheKey) => {
      console.warn('load', cacheKey);
        this.currentCacheKey = cacheKey;

        return new Promise((resolve) => {
          chrome.storage.local.get(LOOKUP_STORAGE_KEY, (storage = {}) => {
            const cache = storage[LOOKUP_STORAGE_KEY] || {};
            const data = cache[cacheKey];

            this.clean(data);
            this.save({}, cacheKey);
            resolve();
          });
        });
      });
  }

  find (address) {
    return this._addresses[address];
  }

  address (address) {
    return this._reverse('_addresses', 'address', address);
  }

  github (handle) {
    if (!this._githubs[handle]) {
      this._githubs[handle] = fetch(`https://api.github.com/users/${handle}`)
        .then((response) => response.json())
        .then((data) => data && data.email)
        .then((email) => {
          const expires = Date.now() + TTLs.success;

          if (!email) {
            this._githubs[handle] = { expires };
            return;
          }

          this._githubs[handle] = { expires, email };
          return this._githubs[handle];
        })
        .catch((error) => {
          const expires = Date.now() + TTLs.error;

          console.error('github', handle, error);
          this._githubs[handle] = { expires, error };
        });
    }

    return Promise
      .resolve(this._githubs[handle])
      .then((data = {}) => {
        const { email, expires } = data;

        // Re-loaded the data if it's too old
        if (expires < Date.now()) {
          return this.load().then(() => this.github(handle));
        }

        if (!email) {
          return { ...data };
        }

        return this.email(email);
      });
  }

  name (input) {
    return this._reverseName(input);
  }

  email (input) {
    return this
      ._reverseEmail(input)
      .then((result) => {
        const data = { ...result, email: input };
        const { address, name } = data;

        // Set in cache the data for the given name
        if (address && name) {
          this._names[name] = { ...data };
        }

        return data;
      });
  }

  _reverseEmail (input) {
    const hash = sha3(input);
    return this._reverse('_emails', 'email', `0x${hash}`, { email: input });
  }

  _reverseName (name) {
    return this._reverse('_names', 'name', name, { name });
  }

  _reverse (cacheKey, method, input, extras = {}) {
    if (!this[cacheKey][input]) {
      this[cacheKey][input] = this.fetch(method, input)
        .then((data) => {
          if (!data || data.status === 'error') {
            return null;
          }

          const { address, ...other } = data;

          if (!address || /^(0x)?0*$/.test(address)) {
            return null;
          }

          return { address, ...other };
        })
        .then((data) => {
          const expires = Date.now() + TTLs.success;

          if (data) {
            this[cacheKey][input] = { ...data, expires, ...extras };

            // Cache the address results
            this._addresses[data.address] = { ...data, expires, ...extras };
          } else {
            this[cacheKey][input] = { expires };
          }
        })
        .catch((error) => {
          const expires = Date.now() + TTLs.error;

          console.error('reverse', cacheKey, method, input, error);

          this[cacheKey][input] = { expires, error };
        })
        .then(() => {
          this.save();
          return this[cacheKey][input];
        });
    }

    return Promise.resolve(this[cacheKey][input])
      .then((data) => {
        if (data && data.expires < Date.now()) {
          return this.load().then(() => this._reverse(cacheKey, method, input, extras));
        }

        return data;
      });
  }

  /**
   * Fetch from the lookup server or from the local node
   * if available.
   *
   * Method is in ['name', 'email']
   */
  fetch (method, input) {
    const { transport } = this.store;

    if (!transport || !transport.isConnected) {
      const lookupMethod = method === 'email'
        ? 'emailHash'
        : method;

      return fetch(`${this.lookupURL}/?${lookupMethod}=${input}`)
        .then((response) => response.json());
    }

    const lookup = ParityLookup(transport.api);

    switch (method) {
      case 'email':
        return lookup.byEmail(input);

      case 'name':
      default:
        return lookup.byName(input);
    }
  }

}
