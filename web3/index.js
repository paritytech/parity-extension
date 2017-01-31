/* global chrome */
/**
 * NOTE: This part is executed on embedded Parity Bar
 *
 * Since we are executing in context of chrome extension
 * we have access to chrome.* APIs
 */

import { createSecureTransport } from './secureTransport';
import { EV_SIGNER_BAR, EV_BAR_CODE } from '../shared';

if (window.location.protocol === 'chrome-extension:') {
  window.secureTransport = createSecureTransport();
  getBackgroundSeed(seed => {
    window.backgroundSeed = seed;
  });
  handleResizeEvents();
  loadScripts();
}

/**
 *  Propagates opening events to upper frame
 */
function handleResizeEvents () {
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
function loadScripts () {
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

function getBackgroundSeed (callback) {
  chrome.storage.local.get('backgroundSeed', res => {
    callback(res.backgroundSeed);
  });
}

