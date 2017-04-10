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

import Config, { DEFAULT_CONFIG } from './config';
import { TRANSPORT_UNINITIALIZED } from '../shared';

const FAILURE = 'Failed to fetch';

export default class Web3 {

  DAPPS = DEFAULT_CONFIG.DAPPS;

  constructor (store) {
    this.store = store;

    Config.get()
      .then((config) => {
        if (config.DAPPS) {
          this.DAPPS = config.DAPPS;
        }
      });
  }

  attachListener (port) {
    return (msg) => {
      const { id } = msg;

      this.web3Message(msg)
        .then((response) => {
          port.postMessage({
            id,
            err: null,
            payload: response,
            connected: true
          });
        })
        .catch((error) => {
          const err = error.message === FAILURE ? TRANSPORT_UNINITIALIZED : error.message;

          port.postMessage({
            id,
            err,
            payload: null
          });
        });
    };
  }

  web3Message (msg) {
    const { payload, origin } = msg;

    const request = {
      method: 'POST',
      mode: 'cors',
      headers: new Headers({
        'Content-Type': 'application/json',
        'X-Parity-Origin': origin
      }),
      body: JSON.stringify(payload),
      redirect: 'error',
      referrerPolicy: 'origin'
    };
    return fetch(`http://${this.DAPPS}/rpc/`, request)
      .catch(err => {
        // TODO [ToDr] Get rid of this in the future!
        // Version 1.7 of Parity runs dapps server on the same port as RPC.
        // Previous versions were running on :8080.
        // For backward compatibility we support both cases.
        const defaultPort = ':' + DEFAULT_CONFIG.DAPPS.split(':')[1];
        const newParityDappsPort = ':8545';
        if (!(err.message === FAILURE && this.DAPPS.endsWith(defaultPort))) {
          throw err;
        }

        const newDapps = this.DAPPS.replace(defaultPort, newParityDappsPort);
        const url = `http://${newDapps}/rpc/`;
        return fetch(url, request).then(res => {
          // Update dapps if it succeeds
          this.DAPPS = newDapps;
          return res;
        });
      })
      .then(response => response.json());
  }

}
