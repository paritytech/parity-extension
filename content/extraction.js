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

export const EXTRACT_TYPE_EMAIL = 'EXTRACT_TYPE_EMAIL';
export const EXTRACT_TYPE_HANDLE = 'EXTRACT_TYPE_HANDLE';
export const EXTRACT_TYPE_GITHUB = 'EXTRACT_TYPE_GITHUB';

export const TYPES = [
  EXTRACT_TYPE_EMAIL,
  EXTRACT_TYPE_HANDLE,
  EXTRACT_TYPE_GITHUB
];

export default class Extraction {

  match = '';
  priority = 0;
  text = null;
  type = null;

  address = null;

  /**
   * Extraction constructor.
   *
   * @param  {String} match     - The match (eg. `foobar@gmail.com`)
   * @param  {String} text      - The type (eg. `EXTRACT_TYPE_EMAIL`)
   * @param  {String} type      - Optional - The text where the match is found
   *                              (eg. `http://facebook.com/foobar`
   *                               where the match is `foobar`)
   * @param  {Number} priority  - Optional - The extraction priority (if multiple extractions
   *                              for the same node, all with results, which one
   *                              should be displayed)
   */
  constructor ({ match, text, type, priority }) {
    this.match = match;
    this.type = type;
    this.text = text || match;

    // Ok since 0 is the default priority
    if (priority) {
      this.priority = priority;
    }
  }

  lookup (lookup) {
    if (this.type === EXTRACT_TYPE_EMAIL) {
      const email = this.match;

      return lookup.email(email)
        .then((result) => {
          this.setAddress(result.address);
        });
    }

    if (this.type === EXTRACT_TYPE_GITHUB) {
      const handle = this.match;

      return lookup.github(handle)
        .then((result) => {
          this.setAddress(result.address);
        });
    }

    if (this.type === EXTRACT_TYPE_HANDLE) {
      const handle = this.match;

      return lookup.name(handle)
        .then((result) => {
          this.setAddress(result.address);
        });
    }
  }

  /**
   * Set the resolved address for the current extraction
   *
   * @param {String} address - The resolved Ethereum Address
   */
  setAddress (address) {
    if (address) {
      this.address = address;
    }
  }

  toObject () {
    const { address, match, priority, type, text } = this;

    const data = {
      address, match, priority, type, text
    };

    return data;
  }

  static fromObject (data) {
    const { address, match, priority, type, text } = data;
    const extraction = new Extraction({
      match, priority, type, text
    });

    if (address) {
      extraction.setAddress(address);
    }

    return extraction;
  }

}
