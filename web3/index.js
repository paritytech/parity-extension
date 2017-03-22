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

/**
 * NOTE: This part is executed on embedded Parity Bar
 *
 * Since we are executing in context of chrome extension
 * we have access to chrome.* APIs
 */

import { createSecureTransport } from './secureTransport';
import { EV_SIGNER_BAR, EV_BAR_CODE, EV_IFRAME_STYLE, isIntegrationEnabled } from '../shared';
import Config from '../background/config';

const IFRAME_BORDER_SIZE = 4;

isIntegrationEnabled()
  .then((enabled) => {
    if (enabled && window.location.protocol === 'chrome-extension:') {
      window.secureTransport = createSecureTransport();

      Config.get().then((config) => {
        window.backgroundSeed = config.backgroundSeed;
        loadScripts(config);
      });

      resizeParityBar();
      handleResizeEvents();
    }
  });

function getParityBarElement () {
  return document.querySelector('#container > div > div');
}

/**
 *  Propagates opening events to upper frame
 */
function handleResizeEvents () {
  document.body.addEventListener('parity.bar.visibility', (ev) => {
    const { opened } = ev.detail;
    const parityBarElement = getParityBarElement();
    const message = {
      type: EV_SIGNER_BAR,
      opened
    };

    parityBarElement.style.maxHeight = '100vh';

    // Resize the iframe if it's closing
    if (!opened) {
      return window.setTimeout(() => {
        resizeParityBar();
      }, 200);
    }

    window.parent.postMessage(message, '*');
  });
}

/**
 * Resize and position the iframe according
 * to the Parity Bar style
 */
function resizeParityBar (wait = 2000) {
  const parityBarElement = getParityBarElement();

  // Try again in 100ms
  if (!parityBarElement && wait > 0) {
    const timeout = 100;
    const nextWait = wait - timeout;

    return setTimeout(() => {
      resizeParityBar(nextWait);
    }, timeout);
  } else if (!parityBarElement) {
    return console.error('the parity bar could not be found after 2s');
  }

  const { height, width } = parityBarElement.getBoundingClientRect();
  const { left, top } = parityBarElement.style;
  const computedStyle = window.getComputedStyle(parityBarElement);
  const iframeStyle = {};

  if (left) {
    iframeStyle.right = '';
    iframeStyle.left = 0;
    iframeStyle.width = (width + parseInt(computedStyle.left) + IFRAME_BORDER_SIZE) + 'px';
  } else {
    iframeStyle.left = '';
    iframeStyle.right = 0;
    iframeStyle.width = (width + parseInt(computedStyle.right) + IFRAME_BORDER_SIZE) + 'px';
  }

  if (top) {
    iframeStyle.bottom = '';
    iframeStyle.top = 0;
    iframeStyle.height = (height + parseInt(computedStyle.top) + IFRAME_BORDER_SIZE) + 'px';
  } else {
    iframeStyle.top = '';
    iframeStyle.bottom = 0;
    iframeStyle.height = (height + parseInt(computedStyle.bottom) + IFRAME_BORDER_SIZE) + 'px';
  }

  window.parent.postMessage({
    type: EV_IFRAME_STYLE,
    style: iframeStyle
  }, '*');
}

/**
 * Loads ParityBar scripts from running node.
 */
function loadScripts (config) {
  // We need to use `port` here cause the response is asynchronous.
  const port = chrome.runtime.connect({ name: 'barScripts' });
  port.onMessage.addListener((code) => {
    if (!code.success) {
      const $loading = document.querySelector('#container .loading');
      const $link = document.createElement('a');
      $link.href = `${code.ui}/#/signer`;
      $link.target = '_blank';
      $link.innerHTML = 'Your Parity version is older than 1.5. <br />You need to open the UI to sign transactions.';

      $loading.classList.add('version');
      $loading.innerHTML = '';
      $loading.appendChild($link);
      return;
    }

    const $script = document.createElement('script');
    $script.src = code.scripts;
    document.body.appendChild($script);

    $script.addEventListener('load', () => {
      configureApi(config);
    });

    if (code.styles) {
      const $styles = document.createElement('link');
      $styles.rel = 'stylesheet';
      $styles.href = code.styles;
      document.head.appendChild($styles);
    }

    port.disconnect();
  });

  port.postMessage({
    type: EV_BAR_CODE
  });
}

function configureApi (config) {
  const { DAPPS } = config;

  const dappsInterface = DAPPS.split(':')[0];
  const dappsPort = DAPPS.split(':')[1];

  // Use the Secure API configure method if available
  if (window.secureApi && typeof window.secureApi.configure === 'function') {
    return window.secureApi.configure({
      dappsInterface, dappsPort
    });
  }

  if (dappsInterface) {
    window.secureApi._dappsInterface = dappsInterface;
  }

  if (dappsPort) {
    window.secureApi._dappsPort = dappsPort;
  }
}
