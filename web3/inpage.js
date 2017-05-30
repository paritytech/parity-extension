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

import Web3 from 'web3/lib/web3';

import Web3FrameProvider from './provider';

/*
 * NOTE: This file is executed in context of the website:
 * It's not a content script!
 */
import {
  EV_TOKEN, EV_NODE_URL
} from '../shared';

import './embed.html';

// Indicate that the extension is installed.
window[Symbol.for('parity.extension')] = {
  version: require('../package.json').version
};

if (!window.chrome || !window.chrome.extension) {
  console.log('Parity - Injecting Web3');

  const provider = new Web3FrameProvider();

  window.Web3 = Web3;
  window.web3 = new Web3(provider);

  window.addEventListener('message', (ev) => {
    if (ev.source !== window) {
      return;
    }

    if (ev.data.type !== EV_NODE_URL) {
      return;
    }

    const UI = ev.data.value;

    // Extract token and background
    if (window.location.origin === `${UI}`) {
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

