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
import Ws from '../web3/ws';

chrome.runtime.onConnect.addListener((port) => {
  if (port.name === 'secureApi') {
    port.onMessage.addListener(web3Message(port));
    return;
  }

  if (port.name === 'barScripts') {
    port.onMessage.addListener(loadScripts(port));
    return;
  }

  // TODO [ToDr] Use connection without elevated privileges here!
  if (port.name === 'web3') {
    port.onMessage.addListener(web3Message(port));
    return;
  }

  if (port.name === 'id') {
    port.onMessage.addListener(processId(port));
    return;
  }

  throw new Error(`Unrecognized port: ${port.name}`);
});

const ui = '127.0.0.1:8180';
let transport = null;

chrome.runtime.onMessage.addListener((request, sender, callback) => {
  if (!(transport && transport.isConnected) && request.token) {
    if (transport) {
      // TODO [ToDr] kill old transport!
    }
    console.log('Extracted a token: ', request.token);
    chrome.storage.local.set({
      'authToken': request.token
    }, () => {});
    transport = new Ws(`ws://${ui}`, request.token, true);
    return;
  }
});

let codeCache = null;
function loadScripts (port) {
  return (msg) => {
    if (msg.type !== 'parity.bar.code') {
      return;
    }

    if (codeCache) {
      codeCache.then(code => port.postMessage(code));
      return;
    }

    const vendor = fetch(`http://${ui}/vendor.js`)
      .then(x => x.blob());
    const embed = fetch(`http://${ui}/embed.html`)
      .then(x => x.text())
      .then(page => ({
        styles: /styles\/embed\.([a-z0-9]{10})\.css/.exec(page),
        scripts: /embed\.([a-z0-9]{10})\.js/.exec(page)
      }))
      .then(res => {
        return Promise.all([
          fetch(`http://${ui}/${res.styles[0]}`),
          fetch(`http://${ui}/${res.scripts[0]}`)
        ]);
      })
      .then(x => Promise.all(x.map(x => x.blob())));

    codeCache = Promise.all([vendor, embed])
      .then(scripts => {
        const vendor = scripts[0];
        const styles = scripts[1][0];
        const embed = scripts[1][1];
        // Concat blobs
        const blob = new Blob([vendor, embed], { type: 'application/javascript' });
        const res = {
          styles: URL.createObjectURL(styles),
          scripts: URL.createObjectURL(blob),
        }
        ;
        port.postMessage(res);
        return res;
      })
      .catch(err => {
        console.error('Could not load ParityBar scripts. Retrying in a while..', err);
        setTimeout(() => loadScripts(port), 5000);
      });
  };
}

chrome.storage.local.get('authToken', (token) => {
  if (!token.authToken) {
    // Open a UI to extract the token from it
    chrome.tabs.create({
      url: `http://${ui}`,
      active: false
    });
    return;
  }
  transport = new Ws(`ws://${ui}`, token.authToken, true);
});

function web3Message (port) {
  return (msg) => {
    const { id, payload } = msg;
    if (!transport || !transport.isConnected) {
      console.error('Transport uninitialized!');
      port.postMessage({
        id, err: 'Transport uninitialized',
        payload: null,
        connected: false
      });
      return;
    }

    transport.executeRaw(payload)
      .then((response) => {
        port.postMessage({
          id,
          err: null,
          payload: response,
          connected: true
        });
      })
      .catch((err) => {
        port.postMessage({
          id,
          err,
          payload: null
        });
      });
  };
}

const processor = new Processor();
function processId (port) {
  return (msg) => {
    let message;

    try {
      message = typeof msg === 'string'
        ? JSON.parse(msg)
        : msg;
    } catch (error) {
      console.error('could not parse message', msg);
      return;
    }

    const { id, data } = message;

    processor
      .process(data)
      .then((result) => {
        console.log('got results', result);

        port.postMessage({
          id, result
        });
      })
      .catch((error) => {
        port.postMessage({
          id, error: error.message
        });

        throw error;
      });
  };
}
