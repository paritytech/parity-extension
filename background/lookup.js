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

import { keccak_256 as sha3 } from 'js-sha3';

let instance = null;

export default class Lookup {

  _badges = {};
  _githubs = {};
  _emails = {};
  _names = {};

  constructor () {
    instance = this;
  }

  static get () {
    if (!instance) {
      return new Lookup();
    }

    return instance;
  }

  static run (matches = {}) {
    const { emails, names, githubs } = matches;
    const lookup = Lookup.get();

    const emailPromises = emails.map((email) => lookup.email(email));
    const namePromises = names.map((name) => lookup.name(name));
    const githubPromises = githubs.map((handle) => lookup.github(handle));

    return Promise
      .all([
        Promise.all(emailPromises),
        Promise.all(namePromises),
        Promise.all(githubPromises)
      ])
      .then(([ emailResults, nameResults, githubResults ]) => {
        return []
          .concat(emailResults, nameResults, githubResults)
          .filter((result) => result && result.address);
      });
  }

  github (handle) {
    if (!this._githubs[handle]) {
      this._githubs[handle] = fetch(`https://api.github.com/users/${handle}`)
        .then((response) => response.json())
        .then((data) => data && data.email)
        .then((email) => {
          const date = Date.now();

          if (!email) {
            this._githubs[handle] = { date };
            return;
          }

          this._githubs[handle] = { date, email };
          return this._githubs[handle];
        })
        .catch((error) => {
          const date = Date.now();

          console.error('github', handle, error);
          this._githubs[handle] = { date, error };
        });
    }

    return Promise
      .resolve(this._githubs[handle])
      .then((data = {}) => {
        const { email } = data;

        if (!email) {
          return { ...data };
        }

        return this.email(email)
          .then((result = {}) => {
            delete result.email;
            return { ...result, name: handle };
          });
      });
  }

  name (input) {
    return this
      ._reverseName(input)
      .then((data) => {
        const { address, badges } = data;

        // Set in cache the data for the given address
        if (address && badges) {
          this._badges[address] = { ...data };
        }

        return data;
      });
  }

  email (input) {
    return this
      ._reverseEmail(input)
      .then((data) => {
        const { address, badges, name } = data;

        // Set in cache the data for the given address
        if (address && badges) {
          this._badges[address] = { ...data };
        }

        // Set in cache the data for the given name
        if (address && name) {
          this._names[name] = { ...data };
        }

        return data;
      });
  }

  _reverseEmail (input) {
    const hash = sha3(input);
    const extra = { email: input, trusted: true };

    return this._reverse('_emails', 'emailHash', `0x${hash}`, extra);
  }

  _reverseName (name) {
    const extra = { trusted: false };
    return this._reverse('_names', 'name', name, extra);
  }

  _reverse (cacheKey, method, input, extra = {}) {
    if (!this[cacheKey][input]) {
      this[cacheKey][input] = fetch(`https://id.parity.io:8443/?${method}=${input}`)
        .then((response) => response.json())
        .then((data) => {
          if (!data || data.status === 'error') {
            return null;
          }

          const { address, ...other } = data;

          if (!address || /^(0x)?0*$/.test(address)) {
            return null;
          }

          return {
            address, ...other, ...extra
          };
        })
        .then((data) => {
          const date = Date.now();

          if (data) {
            this[cacheKey][input] = { ...data, date };
          } else {
            this[cacheKey][input] = { date, ...extra };
          }
        })
        .catch((error) => {
          const date = Date.now();

          console.error('reverse', input, error);

          this[cacheKey][input] = { date, error, ...extra };
        })
        .then(() => {
          return this[cacheKey][input];
        });
    }

    return Promise.resolve(this[cacheKey][input]);
  }

}
