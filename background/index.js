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
import Processor from './processor';
import loadScripts from './loadScripts';
import secureApiMessage from './transport';
import web3Message from './web3';

const processor = new Processor();
chrome.runtime.onConnect.addListener((port) => {
  if (port.name === 'secureApi') {
    port.onMessage.addListener(secureApiMessage(port));
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
    port.onMessage.addListener(processor.getHandler(port));
    return;
  }

  throw new Error(`Unrecognized port: ${port.name}`);
});
