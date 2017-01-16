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
import uuid from 'uuid/v4';

let instance = null;

export default class Runner {

  message = {};
  port = null;

  constructor () {
    this.setup();
    instance = this;
  }

  static get () {
    if (!instance) {
      return new Runner();
    }

    return instance;
  }

  setup () {
    // Setup a Promise-based communication with the background process
    this.port = chrome.runtime.connect({ name: 'id' });
    this.messages = {};

    // Listen for responses
    this.port.onMessage.addListener((msg) => this.handleIncomingMessage(msg));
  }

  static execute (task, data) {
    return Runner.get().execute(task, data);
  }

  execute (task, input) {
    const id = uuid();

    return new Promise((resolve, reject) => {
      // Reject after no answer in 5s
      const timeout = setTimeout(() => {
        reject(`the request #${id} timed out (no response from background)\n${JSON.stringify(data, null, 2)}`);
        delete this.messages[id];
      }, 10 * 1000);

      const data = { type: task, data: input };

      const message = {
        id, data,
        timeout, resolve, reject
      };

      // Add message to the queue
      this.messages[id] = message;

      // postMessage to the background script
      this.port.postMessage({ id, data });
    });
  }

  handleIncomingMessage (msg) {
    let data;

    try {
      data = typeof msg === 'string'
        ? JSON.parse(msg)
        : msg;
    } catch (error) {
      console.error('could not parse message', msg);
      return;
    }

    const { id, result, error } = data;
    const message = this.messages[id];

    if (!message) {
      console.warn('got unexpected response', msg);
      return;
    }

    if (result) {
      message.resolve(result);
    } else {
      message.reject(error || new Error('unknown error\n' + JSON.stringify(data, null, 2)));
    }

    delete this.messages[id];
  }
}
