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

import { Api } from '@parity/parity.js';

import Ws from './ws';
import State from './state';
import Web3 from './web3';

import { TRANSPORT_UNINITIALIZED, EV_WEB3_ACCOUNTS_REQUEST, EV_TOKEN, getRetryTimeout, browser } from '../shared';
import Config, { DEFAULT_CONFIG } from './config';
import analytics, { VERSION, CHAIN } from './analytics';

const ACCOUNTS_METHODS = [
  'parity_setDappAddresses',
  'parity_setDappDefaultAddress',
  'parity_setNewDappsAddresses',
  'parity_setNewDappsDefaultAddress'
];

export default class Transport {
  accountsCache = {};
  extractTokenRetries = 0;
  imageCanvas = null;
  openedTabId = null;
  secureTransport = null;
  UI = DEFAULT_CONFIG.UI;

  store = null;

  get api () {
    return new Api(this.secureTransport);
  }

  get isConnected () {
    return this.secureTransport && this.secureTransport.isConnected;
  }

  get status () {
    if (this.isConnected) {
      return 'connected';
    }

    if (this.secureTransport && this.secureTransport.isConnecting) {
      return 'connecting';
    }

    return 'disconnected';
  }

  get url () {
    return this.secureTransport.url;
  }

  constructor (store) {
    this.store = store;

    // Attempt to extract token on start
    this.extractToken();

    // Pre-create the image canvas
    this.getImageCanvas(76);

    browser.runtime.onMessage.addListener((request, sender, callback) => {
      return this.handleMessage(request, sender, callback);
    });
  }

  cloneCanvas (oldCanvas) {
    const newCanvas = document.createElement('canvas');
    const context = newCanvas.getContext('2d');

    newCanvas.width = oldCanvas.width;
    newCanvas.height = oldCanvas.height;

    context.drawImage(oldCanvas, 0, 0);

    return newCanvas;
  }

  getImageCanvas (size) {
    if (this.imageCanvas) {
      const clonedCanvas = this.cloneCanvas(this.imageCanvas);
      return Promise.resolve(clonedCanvas);
    }

    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      const image = new Image();

      image.onload = () => {
        context.drawImage(image, 0, 0);
        this.imageCanvas = canvas;

        return resolve(this.cloneCanvas(canvas));
      };

      image.src = browser.extension.getURL(`$assets/icon-${size}.png`);
    });
  }

  attachListener (port) {
    const subscriptionForwarder = ({ subscription, result, error }) => {
      port.postMessage({
        subscription,
        err: null,
        payload: { result, error },
        connected: true
      });
    };
    this.secureTransport.on('subscription', subscriptionForwarder);
    port.onDisconnect.addListener(() => {
      this.secureTransport.off('subscription', subscriptionForwarder);
    });

    return this.secureApiMessage(port);
  }

  getNetworkId () {
    if (!this.isConnected) {
      return Promise.resolve(null);
    }

    return this.api.net.version()
      .then((netVersion) => {
        const version = parseInt(netVersion, 10);

        return version;
      });
  }

  getChainName () {
    if (!this.isConnected) {
      return null;
    }

    return this.getNetworkId()
      .then((networkId) => {
        switch (networkId) {
          case 0x1:
            return 'Mainnet';

          case 0x2:
            return 'Morden';

          case 0x3:
            return 'Ropsten';

          case 0x2a:
            return 'Kovan';

          default:
            return null;
        }
      });
  }

  setIcon (status) {
    if (!browser.browserAction) {
      return false;
    }

    console.log('setting icon to ', status);

    const size = 76;

    this.getImageCanvas(size)
      .then((canvas) => {
        const ctx = canvas.getContext('2d');

        switch (status) {
          case 'connected':
            ctx.fillStyle = 'rgba(46, 204, 113, 0.95)';
            break;

          case 'disconnected':
          default:
            ctx.fillStyle = 'rgba(231, 76, 60, 0.75)';
            break;
        }

        ctx.strokeStyle = 'white';
        ctx.beginPath();
        ctx.arc(15, 20, 12, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();

        const pixels = ctx.getImageData(0, 0, size, size);

        browser.browserAction.setIcon({ imageData: pixels });
      });
  }

  initiate (token) {
    // First check if it's a post Parity 1.7 version.
    new Web3(this.UI).web3Message({
      payload: [{
        id: '1',
        jsonrpc: '2.0',
        method: 'parity_wsUrl',
        params: []
      }, {
        id: '2',
        jsonrpc: '2.0',
        method: 'parity_dappsUrl',
        params: []
      }]
    })
      .then(([wsUrl, dappsUrl]) => {
        if (wsUrl && dappsUrl && wsUrl.result && dappsUrl.result) {
          const protocol = this.UI.split('://')[0] || 'http';
          Config.set({
            DAPPS: `${protocol}://${dappsUrl.result}`
          });
          this.connect(`${protocol}://${wsUrl.result}`, token);
          return;
        }

        throw new Error('Old version of Parity detected.');
      })
      .catch(() => {
        this.connect(this.UI, token);
      });
  }

  connect (url, token) {
    const wsUrl = url.replace('https://', 'wss://').replace('http://', 'ws://');
    const secureTransport = new Ws(wsUrl, token, true);

    this.setIcon('disconnected');

    secureTransport.on('open', () => {
      this.setIcon('connected');

      this.refreshAccountsCache();

      // fetch version
      Promise.all([
        secureTransport.execute('web3_clientVersion').then(version => {
          State.version = version;
          return version;
        }),
        this.getChainName()
      ])
        .then(([version, chain]) => {
          Config.set({
            lastVersion: version,
            lastChain: chain
          });

          analytics.ifEnabled(() => {
            analytics.set(VERSION, version);
            analytics.set(CHAIN, chain);
            analytics.event('connection', 'connected');
          });
        });

      this.store.lookup.load();
    });

    secureTransport.on('close', () => {
      this.setIcon('disconnected');
      analytics.ifEnabled(() => {
        analytics.event('connection', 'disconnected');
      });
      State.version = null;

      this.store.lookup.load();
    });

    secureTransport.on('subscription', ({ subscription, error, result }) => {

    });

    this.secureTransport = secureTransport;
  }

  close () {
    this.secureTransport && this.secureTransport.close();
  }

  extractToken () {
    return Config.get()
      .then((config) => {
        if (config.UI) {
          this.UI = config.UI;
        }

        if (config.authToken) {
          if (this.secureTransport) {
            this.close();
          }

          this.initiate(config.authToken);
          return;
        }

        return fetch(`${this.UI}`)
          .then(() => {
            // Open a UI to extract the token from it
            browser.tabs.create({
              url: `${this.UI}/#/?from=` + browser.runtime.id,
              active: false
            }, (tab) => {
              this.openedTabId = tab.id;
            });

            this.extractTokenRetries = 0;
          })
          .catch(err => {
            console.error('Node seems down, will re-try', err);
            this.extractTokenRetries += 1;

            setTimeout(() => {
              return this.extractToken();
            }, getRetryTimeout(this.extractTokenRetries));
          });
      });
  }

  fetchAccountsForCache (origin) {
    return this.secureTransport.execute('parity_getDappsAddresses', origin)
      .catch(() => {
        // Cater for new version of parity (> 1.6)
        // TODO [ToDr] Remove support for older version completely.
        return this.secureTransport.execute('parity_getDappAddresses', origin);
      })
      .then(accounts => {
        this.accountsCache[origin] = accounts;

        // Clear random entries if it's getting too large.
        const origins = Object.keys(this.accountsCache);

        while (origins.length > 512) {
          const idx = Math.floor(Math.random() * origins.length);
          const origin = origins.splice(idx, 1)[0];

          delete this.accountsCache[origin];
        }

        return accounts;
      });
  }

  refreshAccountsCache () {
    const oldOrigins = Object.keys(this.accountsCache);

    this.accountsCache = {};

    // re-populate cache
    oldOrigins.forEach(origin => {
      this.fetchAccountsForCache(origin);
    });
  }

  secureApiMessage (port) {
    return (msg) => {
      const { id, payload } = msg;

      if (!this.isConnected) {
        console.error('Transport uninitialized!');

        port.postMessage({
          id, err: TRANSPORT_UNINITIALIZED,
          payload: null,
          connected: false
        });

        return;
      }

      this.secureTransport.executeRaw(payload)
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

      // Deep-inspect payload and invalidate accounts cache.
      if (ACCOUNTS_METHODS.indexOf(payload.method) !== -1) {
        this.refreshAccountsCache();
      }
    };
  }

  handleMessage (request, sender, callback) {
    const isTransportReady = this.isConnected;

    if (request.type === EV_WEB3_ACCOUNTS_REQUEST) {
      if (!isTransportReady) {
        return callback(error({
          err: TRANSPORT_UNINITIALIZED
        }));
      }

      const { origin } = request;
      const accounts = this.accountsCache[origin];

      if (accounts) {
        // Refresh accounts later
        this.fetchAccountsForCache(origin);

        // But return the result immediately.
        return callback(error({
          err: null,
          payload: accounts
        }));
      }

      // Fetch accounts.
      this.fetchAccountsForCache(origin)
        .then(accounts => callback(error({
          err: null,
          payload: accounts
        })))
        .catch(err => callback(error({
          err,
          payload: null
        })));

      // The response will be provided asynchronously.
      return true;
    }

    if (request.type !== EV_TOKEN) {
      return;
    }

    if (!isTransportReady && request.token) {
      if (this.secureTransport) {
        this.secureTransport.close();
      }

      if (this.openedTabId) {
        browser.tabs.remove(this.openedTabId);
        this.openedTabId = null;
      }

      console.log('Extracted a token: ', request.token);
      console.log('Extracted backgroundSeed: ', request.backgroundSeed);

      Config.set({
        'authToken': request.token,
        'backgroundSeed': request.backgroundSeed
      });

      this.initiate(request.token);
    }
  }
}

function error (err) {
  const e = new Error(err.err);
  Object.keys(err).map(key => {
    e[key] = err[key];
  });
  return e;
}
