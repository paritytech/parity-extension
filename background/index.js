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

import Processor from './processor';
import loadScripts from './loadScripts';
import web3Message from './web3';

import Config from './config';
import Images from './images';
import Lookup from './lookup';
import Transport from './transport';
import Store from './store';

const store = new Store();

store.images = new Images(store);
store.lookup = new Lookup(store);
store.processor = new Processor(store);
store.transport = new Transport(store);

chrome.runtime.onConnect.addListener((port) => {
  if (port.name === 'secureApi') {
    port.onMessage.addListener(store.transport.attachListener(port));
    return;
  }

  if (port.name === 'barScripts') {
    port.onMessage.addListener(loadScripts(port));
    return;
  }

  if (port.name === 'web3') {
    port.onMessage.addListener(web3Message(port));
    return;
  }

  if (port.name === 'id') {
    port.onMessage.addListener(store.processor.attachListener(port));
    return;
  }

  throw new Error(`Unrecognized port: ${port.name}`);
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const { action } = message;

  switch (action) {
    case 'isAugmentationEnabled':
      Config.get()
        .then((config) => {
          const { augmentationEnabled = true } = config;

          sendResponse(augmentationEnabled);
        });

      return true;

    case 'isIntegrationEnabled':
      Config.get()
        .then((config) => {
          const { integrationEnabled = true } = config;

          sendResponse(integrationEnabled);
        });

      return true;

    case 'getExtractions':
      chrome.tabs.query({ currentWindow: true, active: true }, (tabs) => {
        const extractions = store.processor.getExtractions(tabs[0]);
        sendResponse(extractions);
      });

      return true;
  }
});
