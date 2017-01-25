/*
 * NOTE: This file is executed in context of the website:
 * It's not a content script!
 */
import { UI, getRetryTimeout } from '../shared';

class Web3FrameProvider {
  id = 0;
  callbacks = {};
  accounts = null;
  _retries = 0;

  constructor () {
    window.addEventListener('message', (ev) => {
      if (ev.source !== window) {
        return;
      }

      if (!ev.data.type) {
        return;
      }

      if (ev.data.type === 'parity.web3.accounts.response' && this.onAccounts) {
        this.onAccounts(ev.data.err, ev.data.payload);
        return;
      }

      if (ev.data.type !== 'parity.web3.response') {
        return;
      }

      const { id, err, payload } = ev.data;
      const cb = this.callbacks[id];
      delete this.callbacks[id];

      if (!cb) {
        console.warn(`Unexpected response for ${id} received.`, ev.data);
        return;
      }

      cb(err, payload);
    });

    this.initializeMainAccount();
  }

  initializeMainAccount () {
    this._retries += 1;
    window.postMessage({
      type: 'parity.web3.accounts.request'
    }, '*');
  }

  onAccounts (err, accounts) {
    if (err) {
      setTimeout(() => this.initializeMainAccount(), getRetryTimeout(this._retries));
      return;
    }

    this.accounts = accounts;
  }

  sendAsync = (payload, cb) => {
    this.id += 1;
    this.callbacks[this.id] = cb;
    window.postMessage({
      type: 'parity.web3.request',
      id: this.id,
      payload: payload
    }, '*');
  };

  send = (payload) => {
    const { id, method, jsonrpc } = payload;
    if (method === 'eth_accounts') {
      const result = this.accounts || [];
      return { id, jsonrpc, result };
    }

    if (method === 'eth_coinbase') {
      const result = (this.accounts && this.accounts[0]) || '0x0000000000000000000000000000000000000000';
      return { id, jsonrpc, result };
    }

    if (method === 'eth_uninstallFilter') {
      this.sendAsync(payload, () => {});
      return {
        id, jsonrpc,
        result: true
      };
    }

    throw new Error('Async methods not supported.');
  };

  isConnected () {
    return true;
  }
}

if (!window.chrome || !window.chrome.extension) {
  console.log('Parity - Injecting Web3');
  window.web3 = {
    currentProvider: new Web3FrameProvider()
  };

  // Extract token and background
  if (window.location.origin === `http://${UI}`) {
    // TODO [ToDr] Validate token?
    const token = fromJson(localStorage.getItem('sysuiToken'));
    const backgroundSeed = fromJson(localStorage.getItem('backgroundSeed'));
    if (token) {
      window.postMessage({
        type: 'parity.token',
        token,
        backgroundSeed
      }, '*');
    }
  }
}

function fromJson (val) {
  try {
    return JSON.parse(val);
  } catch (e) {
    return val;
  }
}

