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

import './embed.html';

/*
 * NOTE: This file is executed in context of the website:
 * It's not a content script!
 */
import {
  EV_TOKEN, EV_NODE_URL
} from '../shared';

import Web3FrameProvider from './provider';

// Indicate that the extension is installed.
window[Symbol.for('parity.extension')] = {
  version: require('../package.json').version
};

if (!window.chrome || !window.chrome.extension) {
  console.log('Parity - Injecting Web3');

  const web3 = {
    currentProvider: new Web3FrameProvider(),
    injectedWeb3: null
  };

  const proxiedWeb3 = new Proxy(web3, {
    get: (target, name, receiver) => {
      // If the web3 object already has the
      // requested value, return it (current provider)
      if (target[name]) {
        return target[name];
      }

      // Else, add a full web3 instance
      if (!web3.injectedWeb3) {
        require('./lib');

        web3.injectedWeb3 = window.web3;

        return window.web3[name];
      }

      // And return the value from this web3 instance
      return web3.injectedWeb3[name];
    }
  });

  window.web3 = proxiedWeb3;

  window.addEventListener('message', (ev) => {
    if (ev.source !== window) {
      return;
    }

    if (ev.data.type !== EV_NODE_URL) {
      return;
    }

    const UI = ev.data.value;

    // Extract token and background
    if (window.location.origin === `http://${UI}`) {
      // TODO [ToDr] Validate token?
      const token = fromJson(localStorage.getItem('sysuiToken'));
      const backgroundSeed = fromJson(localStorage.getItem('backgroundSeed'));

      if (token) {
        window.postMessage({
          type: EV_TOKEN,
          token,
          backgroundSeed
        }, '*');
      }
    }
  });
}

function fromJson (val) {
  try {
    return JSON.parse(val);
  } catch (e) {
    return val;
  }
}

