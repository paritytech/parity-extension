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
import Ws from './ws';

import { UI, TRANSPORT_UNINITIALIZED } from '../shared';

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

let transport = null;
// Attempt to extract token on start if not available.
extractToken();

chrome.runtime.onMessage.addListener((request, sender, callback) => {
  if (!(transport && transport.isConnected) && request.token) {
    if (transport) {
      // TODO [ToDr] kill old transport!
    }
    console.log('Extracted a token: ', request.token);
    console.log('Extracted backgroundSeed: ', request.backgroundSeed);
    chrome.storage.local.set({
      'authToken': request.token,
      'backgroundSeed': request.backgroundSeed
    }, () => {});
    transport = new Ws(`ws://${UI}`, request.token, true);
    return;
  }
});

let codeCache = null;
function loadScripts (port) {
  function retry (msg) {
    if (msg.type !== 'parity.bar.code') {
      return;
    }

    if (!codeCache) {
      const vendor = fetch(`http://${UI}/vendor.js`)
        .then(x => x.blob());
      const embed = fetch(`http://${UI}/embed.html`)
        .then(x => x.text())
        .then(page => ({
          styles: /styles\/embed\.([a-z0-9]{10})\.css/.exec(page),
          scripts: /embed\.([a-z0-9]{10})\.js/.exec(page)
        }))
        .then(res => {
          return Promise.all([
            fetch(`http://${UI}/${res.styles[0]}`),
            fetch(`http://${UI}/${res.scripts[0]}`)
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
          return {
            styles: URL.createObjectURL(styles),
            scripts: URL.createObjectURL(blob)
          };
        });
    }

    codeCache
      .then(code => port.postMessage(code))
      .catch(err => {
        codeCache = null;
        console.error('Could not load ParityBar scripts. Retrying in a while..', err);
        setTimeout(() => retry(msg), 5000);
      });
  }

  return retry;
}

function extractToken () {
  chrome.storage.local.get('authToken', (token) => {
    if (!token.authToken) {
      fetch(`http://${UI}`)
        .then(() => {
          // Open a UI to extract the token from it
          chrome.tabs.create({
            url: `http://${UI}`,
            active: false
          });
        })
        .catch(err => {
          console.error('Node seems down, will re-try', err);
          setTimeout(() => extractToken(), 1000);
        });
      return;
    }

    transport = new Ws(`ws://${UI}`, token.authToken, true);
  });
}

function web3Message (port) {
  return (msg) => {
    const { id, payload } = msg;
    if (!transport || !transport.isConnected) {
      console.error('Transport uninitialized!');
      port.postMessage({
        id, err: TRANSPORT_UNINITIALIZED,
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
