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

// Adapted from https://raw.githubusercontent.com/ethcore/parity/master/js/src/api/transport/ws/ws.js

/* global WebSocket */

import EventEmitter from 'eventemitter3';
import { keccak_256 } from 'js-sha3'; // eslint-disable-line camelcase
import { getRetryTimeout } from '../shared';

class JsonRpcBase extends EventEmitter {
  constructor () {
    super();

    this._id = 1;
    this._debug = false;
    this._connected = false;
  }

  encode (method, params) {
    const json = JSON.stringify({
      jsonrpc: '2.0',
      method: method,
      params: params,
      id: this._id++
    });

    return json;
  }

  _setConnected () {
    if (!this._connected) {
      this._connected = true;
      this.emit('open');
    }
  }

  _setDisconnected () {
    if (this._connected) {
      this._connected = false;
      this.emit('close');
    }
  }

  get id () {
    return this._id;
  }

  get nextId () {
    return this._id++;
  }

  get isDebug () {
    return this._debug;
  }

  get isConnected () {
    return this._connected;
  }

  setDebug (flag) {
    this._debug = flag;
  }

  error (error) {
    if (this.isDebug) {
      console.error(error);
    }
  }

  log (log) {
    if (this.isDebug) {
      console.log(log);
    }
  }
}

export default class Ws extends JsonRpcBase {
  constructor (url, token, autoconnect = true) {
    super();

    this._url = url;
    this._token = token;
    this._messages = {};
    this._rawRequests = {};

    this._connecting = false;
    this._connected = false;
    this._lastError = null;
    this._autoConnect = autoconnect;
    this._retries = 0;
    this._reconnectTimeoutId = null;

    this._connectPromise = null;
    this._connectPromiseFunctions = {};

    if (autoconnect) {
      this.connect();
    }
  }

  updateToken (token, connect = true) {
    this._token = token;
    // this._autoConnect = true;

    if (connect) {
      this.connect();
    }
  }

  connect () {
    if (this._connected) {
      return Promise.resolve();
    }

    if (this._connecting) {
      return this._connectPromise || Promise.resolve();
    }

    if (this._reconnectTimeoutId) {
      window.clearTimeout(this._reconnectTimeoutId);
      this._reconnectTimeoutId = null;
    }

    const time = parseInt(new Date().getTime() / 1000, 10);
    const sha3 = keccak_256(`${this._token}:${time}`);
    const hash = `${sha3}_${time}`;

    if (this._ws) {
      this._ws.onerror = null;
      this._ws.onopen = null;
      this._ws.onclose = null;
      this._ws.onmessage = null;
      this._ws.close();
      this._ws = null;
    }

    this._connecting = true;
    this._connected = false;
    this._lastError = null;

    this._ws = new WebSocket(this._url, hash);
    this._ws.onerror = this._onError;
    this._ws.onopen = this._onOpen;
    this._ws.onclose = this._onClose;
    this._ws.onmessage = this._onMessage;

    this._connectPromise = new Promise((resolve, reject) => {
      this._connectPromiseFunctions = { resolve, reject };
    });

    return this._connectPromise;
  }

  _onOpen = (event) => {
    this._setConnected();
    this._connecting = false;
    this._retries = 0;

    Object.keys(this._messages)
      .filter((id) => this._messages[id].queued)
      .forEach(this._send);

    this._connectPromiseFunctions.resolve();

    this._connectPromise = null;
    this._connectPromiseFunctions = {};
  }

  _onClose = (event) => {
    this._setDisconnected();
    this._connecting = false;

    event.timestamp = Date.now();
    this._lastError = event;

    if (this._autoConnect) {
      const timeout = this.retryTimeout;

      const time = timeout < 1000
        ? Math.round(timeout) + 'ms'
        : (Math.round(timeout / 10) / 100) + 's';

      console.log('ws:onClose', `trying again in ${time}...`);

      this._reconnectTimeoutId = setTimeout(() => {
        this.connect();
      }, timeout);

      return;
    }

    if (this._connectPromise) {
      this._connectPromiseFunctions.reject(event);

      this._connectPromise = null;
      this._connectPromiseFunctions = {};
    }

    console.log('ws:onClose');
  }

  _onError = (event) => {
    // Only print error if the WS is connected
    // ie. don't print if error == closed
    window.setTimeout(() => {
      if (this._connected) {
        console.error('ws:onError');

        event.timestamp = Date.now();
        this._lastError = event;

        if (this._connectPromise) {
          this._connectPromiseFunctions.reject(event);

          this._connectPromise = null;
          this._connectPromiseFunctions = {};
        }
      }
    }, 50);
  }

  _onMessage = (event) => {
    // Event sent by Signer Broadcaster
    if (event.data === 'new_message') {
      return false;
    }

    try {
      const result = JSON.parse(event.data);
      const resultId = result.id || result[0].id;
      const messageId = this._rawRequests[resultId] || resultId;
      const isRaw = !!this._rawRequests[resultId];
      const { method, params, resolve, reject } = this._messages[messageId];

      delete this._messages[messageId];
      delete this._rawRequests[resultId];

      if (isRaw) {
        resolve(result);
        return;
      }

      if (result.error) {
        this.error(event.data);

        // Don't print error if request rejected or not is not yet up...
        if (!/(rejected|not yet up)/.test(result.error.message)) {
          console.error(`${method}(${JSON.stringify(params)}): ${result.error.code}: ${result.error.message}`);
        }

        const error = new Error(`${method}: ${result.error.code}: ${result.error.message}`);
        reject(error);

        return;
      }

      resolve(result.result);
    } catch (e) {
      console.error('ws::_onMessage', event.data, e);
    }
  }

  _send = (id) => {
    const message = this._messages[id];

    if (this._connected) {
      return this._ws.send(message.json);
    }

    message.queued = !this._connected;
    message.timestamp = Date.now();
  }

  executeRaw (requests) {
    return new Promise((resolve, reject) => {
      const id = this.nextId;
      const json = JSON.stringify(requests);
      const rawId = requests.id || requests[0].id;

      this._rawRequests[rawId] = id;
      this._messages[id] = { id, method: 'raw', params: requests, json, resolve, reject };
      this._send(id);
    });
  }

  execute (method, ...params) {
    return new Promise((resolve, reject) => {
      const id = this.id;
      const json = this.encode(method, params);

      this._messages[id] = { id, method, params, json, resolve, reject };
      this._send(id);
    });
  }

  get token () {
    return this._token;
  }

  get isAutoConnect () {
    return this._autoConnect;
  }

  get isConnecting () {
    return this._connecting;
  }

  get lastError () {
    return this._lastError;
  }

  /**
   * Exponential Timeout for Retries
   *
   * @see http://dthain.blogspot.de/2009/02/exponential-backoff-in-distributed.html
   */
  get retryTimeout () {
    this._retries += 1;
    return getRetryTimeout(this._retries - 1);
  }
}

