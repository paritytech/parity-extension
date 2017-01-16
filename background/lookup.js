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

let instance = null;

export default class Lookup {

  _badges = {};
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
    if (!this._emails[input]) {
      this._emails[input] = fetch(`https://id.parity.io:8443/?email=${input}`)
        .then((response) => response.json())
        .then((data) => {
            if (!data || data.status === 'error') {
              return null;
            }

            const { address, name, badges } = data;

            if (!address || /^(0x)?0*$/.test(address)) {
              return null;
            }

            return {
              address, badges, name, email: input
            };
        })
        .then((data) => {
          const date = Date.now();

          if (data) {
            this._emails[input] = { ...data, date };
          } else {
            this._emails[input] = { date, email: input };
          }
        })
        .catch((error) => {
          const date = Date.now();

          console.error('email reverse', input, error);

          this._emails[input] = { date, error, email: input };
        })
        .then(() => {
          return this._emails[input];
        });
    }

    return Promise.resolve(this._emails[input]);
  }

}
