/*
 * NOTE: Executed in extension context
 */
import { TRANSPORT_UNINITIALIZED, EV_WEB3_REQUEST, EV_SIGNER_BAR, EV_BAR_CODE } from '../shared';

/**
 * Creates a secureTransport, that can be used by injected ParityBar
 */
export function createSecureTransport () {
  let id = 0;
  let isConnected = true;
  const data = {};
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
      isConnected = err !== TRANSPORT_UNINITIALIZED;
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
    on () {
      // TODO [ToDr] Would be good to handle all requests correctly.
      console.log('listener', arguments);
    },
    get isConnected () {
      return isConnected;
    }
  };
}

/**
 *  Propagates opening events to upper frame
 */
export function handleResizeEvents () {
  document.body.addEventListener('parity.bar.visibility', (ev) => {
    document.querySelector('#container > div > div').style.maxHeight = '100vh';
    window.parent.postMessage({
      type: EV_SIGNER_BAR,
      opened: ev.detail.opened
    }, '*');
  });
}

/**
 * Loads ParityBar scripts from running node.
 */
export function loadScripts () {
  // We need to use `port` here cause the response is asynchronous.
  const port = chrome.runtime.connect({ name: 'barScripts' });
  port.onMessage.addListener((code) => {
    if (!code.success) {
      const $loading = document.querySelector('#container .loading');
      const $link = document.createElement('a');
      $link.href = `${code.ui}/#/signer`;
      $link.target = '_blank';
      $link.innerHTML = 'Your Parity version is older than 1.5. <br />You need to open UI to sign transactions.';

      $loading.classList.add('version');
      $loading.innerHTML = '';
      $loading.appendChild($link);
      return;
    }

    const $script = document.createElement('script');
    const $styles = document.createElement('link');

    $script.src = code.scripts;
    $styles.rel = 'stylesheet';
    $styles.href = code.styles;
    document.head.appendChild($styles);
    document.body.appendChild($script);

    port.disconnect();
  });

  port.postMessage({
    type: EV_BAR_CODE
  });
}

export function getBackgroundSeed (callback) {
  chrome.storage.local.get('backgroundSeed', res => {
    callback(res.backgroundSeed);
  });
}

