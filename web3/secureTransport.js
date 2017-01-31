/* global chrome */

/*
 * NOTE: Executed in extension context
 */
import { TRANSPORT_UNINITIALIZED, EV_WEB3_REQUEST } from '../shared';

/**
 * Creates a secureTransport, that can be used by injected ParityBar
 */
export function createSecureTransport () {
  let id = 0;
  let isConnected = true;
  const data = {};
  const listeners = {};
  const port = chrome.runtime.connect({ name: 'secureApi' });

  port.onMessage.addListener((msg) => {
    const { id, err, payload } = msg;
    if (!data[id]) {
      console.warn('Unexpected response received: ', id, msg);
      return;
    }
    const { resolve, reject } = data[id];
    delete data[id];

    if (err || payload.error) {
      let wasConnected = isConnected;
      isConnected = err !== TRANSPORT_UNINITIALIZED;
      if (wasConnected && !isConnected) {
        listeners['close'].forEach(listener => listener());
      }
      reject(err || payload.error);
    } else {
      isConnected = true;
      resolve(payload.result);
    }
  });

  return {
    execute (method, ...params) {
      return new Promise((resolve, reject) => {
        id++;
        data[id] = { resolve, reject, method, params };
        const request = {
          jsonrpc: '2.0',
          id,
          method,
          params
        };

        port.postMessage({
          id,
          type: EV_WEB3_REQUEST,
          payload: request
        });
      });
    },
    on (event, callback, context) {
      listeners[event] = listeners[event] || [];
      listeners[event].push(callback.bind(context));
    },
    get isConnected () {
      return isConnected;
    }
  };
}

