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

let currentID = 0;

import { browser } from '../shared';

export default class Runner {

  message = {};
  port = null;

  store = null;

  constructor (store) {
    this.store = store;

    this.setup();
  }

  setup () {
    // Setup a Promise-based communication with the background process
    this.port = browser.runtime.connect({ name: 'id' });
    this.messages = {};

    // Listen for responses
    this.port.onMessage.addListener((msg) => this.handleIncomingMessage(msg));
  }

  execute (task, input) {
    const id = currentID++;

    return new Promise((resolve, reject) => {
      const data = { type: task, data: input };

      const message = {
        id, data,
        resolve, reject
      };

      // Add message to the queue
      this.messages[id] = message;

      // postMessage to the background script
      this.port.postMessage({ id, data });
    });
  }

  handleIncomingMessage (data = {}) {
    const { id, result, error } = data;
    const message = this.messages[id];

    if (!message) {
      console.warn('got unexpected response', data);
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
