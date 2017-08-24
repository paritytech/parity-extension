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

import {
  getRetryTimeout,
  EV_WEB3_REQUEST, EV_WEB3_RESPONSE,
  EV_WEB3_ACCOUNTS_REQUEST, EV_WEB3_ACCOUNTS_RESPONSE,
  TRANSPORT_UNINITIALIZED
} from '../shared';

export default class Web3FrameProvider {
  id = 0;
  callbacks = {};
  accounts = null;
  _isConnected = true;
  _retries = 0;

  constructor () {
    window.addEventListener('message', (ev) => {
      if (ev.source !== window) {
        return;
      }

      if (!ev.data || !ev.data.type) {
        return;
      }

      if (ev.data.type === EV_WEB3_ACCOUNTS_RESPONSE && this.onAccounts) {
        this.onAccounts(ev.data.err, {
          result: ev.data.payload
        });
        return;
      }

      if (ev.data.type !== EV_WEB3_RESPONSE) {
        return;
      }

      if (ev.data.err === TRANSPORT_UNINITIALIZED) {
        if (this.isConnected()) {
          // re-fetch accounts in case it's disconnected
          this.initializeMainAccount();
        }
        this._isConnected = false;
      } else {
        this._isConnected = true;
      }

      const { id, err, payload } = ev.data;
      const cb = this.callbacks[id];
      delete this.callbacks[id];

      if (!cb) {
        console.warn(`Unexpected response for ${id} received.`, ev.data);
        return;
      }

      cb(err, payload);
    });

    this.initializeMainAccount();
  }

  initializeMainAccount () {
    this._retries += 1;
    window.postMessage({
      type: EV_WEB3_ACCOUNTS_REQUEST
    }, '*');
  }

  onAccounts (err, accounts) {
    if (err || !accounts.result) {
      setTimeout(() => this.initializeMainAccount(), getRetryTimeout(this._retries));
      return;
    }

    this.accounts = accounts.result;

    // Set default account for global object.
    if (this.accounts[0] && global.web3 && 'eth' in global.web3) {
      global.web3.eth.defaultAccount = this.accounts[0];
    }
  }

  request (method, cb) {
    this.sendAsync({
      jsonrpc: '2.0',
      id: this.id,
      method,
      params: []
    }, cb);
  }

  sendAsync = (payload, cb) => {
    this.id += 1;
    this.callbacks[this.id] = cb;
    window.postMessage({
      type: EV_WEB3_REQUEST,
      id: this.id,
      payload: payload
    }, '*');
  };

  send = (payload) => {
    const { id, method, jsonrpc } = payload;
    if (method === 'eth_accounts') {
      // Make a accounts request to refresh them
      this.request('eth_accounts', (err, payload) => this.onAccounts(err, payload));
      const result = this.accounts || [];
      return { id, jsonrpc, result };
    }

    if (method === 'eth_coinbase') {
      this.request('eth_accounts', (err, payload) => this.onAccounts(err, payload));
      const result = (this.accounts && this.accounts[0]) || '0x0000000000000000000000000000000000000000';
      return { id, jsonrpc, result };
    }

    if (method === 'eth_uninstallFilter') {
      this.sendAsync(payload, () => {});
      return {
        id, jsonrpc,
        result: true
      };
    }

    throw new Error('Synchronous methods are not supported.');
  };

  isConnected () {
    return this._isConnected;
  }
}
