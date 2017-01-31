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

import { PROCESS_EXTRACTIONS, FETCH_ADDRESS } from '../background/processor';
import Extractions from './extractions';
import Runner from './runner';

let instance = null;

export default class Accounts {

  accounts = {};

  static get () {
    if (!instance) {
      instance = new Accounts();
    }

    return instance;
  }

  static find (address) {
    const self = Accounts.get();

    return self.accounts[address];
  }

  static fetch (address) {
    const self = Accounts.get();

    return self.fetchAddress(address);
  }

  static processExtractions (extractions) {
    const self = Accounts.get();

    return Runner.execute(PROCESS_EXTRACTIONS, extractions.toObject())
      .then((results) => {
        const nextExtractions = Extractions.fromObject(results);
        const addresses = nextExtractions.addresses;

        // Replace the extractions with the new ones
        extractions.replaceWith(nextExtractions);

        // Fetch addresses info
        return self.fetchAddresses(addresses);
      });
  }

  fetchAddresses (addresses = []) {
    const promises = addresses.map((address) => this.fetchAddress(address));

    return Promise.all(promises);
  }

  fetchAddress (address) {
    if (!this.accounts[address]) {
      this.accounts[address] = Runner.execute(FETCH_ADDRESS, address)
        .then((data) => {
          this.accounts[address] = data;
          return data;
        });
    }

    return Promise.resolve(this.accounts[address]);
  }

}
