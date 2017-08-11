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

import { uniq } from 'lodash';

import Extractions from '../content/extractions';
import { browser } from '../shared';

export const FETCH_ADDRESS = 'FETCH_ADDRESS';
export const PROCESS_EXTRACTIONS = 'PROCESS_EXTRACTIONS';
export const FETCH_IMAGE = 'FETCH_IMAGE';

export default class Processor {
  // Contains the extracted addresses
  // per tab
  _extractions = {};

  store = null;

  constructor (store) {
    this.store = store;

    browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      if (changeInfo.status === 'loading') {
        delete this._extractions[tabId];
      }
    });

    browser.tabs.onRemoved.addListener((tabId) => {
      delete this._extractions[tabId];
    });
  }

  process (input = {}, tab = {}) {
    const { data, type } = input;

    switch (type) {
      case PROCESS_EXTRACTIONS:
        const extractions = Extractions.fromObject(data);

        return this.processExtractions(extractions)
          .then(() => extractions.toObject())
          .then((result) => {
            if (result && tab.id) {
              const addresses = result.map((data) => data.address);
              const nextExtractions = []
                .concat(this._extractions[tab.id] || [])
                .concat(addresses)
                .filter((address) => address);

              this._extractions[tab.id] = uniq(nextExtractions);

              // Set the number of extractions as a badge
              if (browser.browserAction) {
                browser.browserAction.setBadgeText({
                  text: this._extractions[tab.id].length.toString(),
                  tabId: tab.id
                });
              }
            }

            return result;
          });

      case FETCH_ADDRESS:
        return this.fetchAddress(data);

      case FETCH_IMAGE:
        return this.fetchImage(data);

      default:
        return Promise.reject(new Error(`no actions matching  ${type}`));
    }
  }

  getExtractions (tab = {}) {
    const extractions = this._extractions[tab.id];

    if (!extractions) {
      return [];
    }

    const { lookup } = this.store;

    return extractions
      .map((address) => {
        const data = lookup.find(address);
        return data;
      })
      .filter((data) => data);
  }

  fetchAddress (address) {
    const { lookup } = this.store;

    return lookup.address(address);
  }

  fetchImage (url) {
    return this.store.images.fetchImage(url);
  }

  processExtractions (extractions) {
    console.log('received extractions', extractions.toObject());

    const { lookup } = this.store;
    const promises = extractions.map((extraction) => {
      return extraction.lookup(lookup);
    });

    return Promise.all(promises);
  }

  attachListener (port, store) {
    const { tab } = port.sender;

    return (message = {}) => {
      const { id, data } = message;

      this
        .process(data, tab)
        .then((result) => {
          port.postMessage({
            id, result
          });
        })
        .catch((error) => {
          port.postMessage({
            id, error: error
          });

          throw error;
        });
    };
  }
}
