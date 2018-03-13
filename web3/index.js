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
 * Since we are executing in context of browser extension
 * we have access to browser.* APIs
 */

import { isEqual, pick } from 'lodash';

import { createSecureTransport } from './secureTransport';
import { EV_SIGNER_BAR, EV_BAR_CODE, isIntegrationEnabled, browser } from '../shared';
import Config from '../background/config';

const IFRAME_BORDER_SIZE = 4;
const BAR_MIN_WIDTH = 350;
const BAR_MIN_HEIGHT = 60;

let parityBarBoundingRect;

isIntegrationEnabled()
  .then((enabled) => {
    if (enabled && isWebExtensionPage()) {
      window.secureTransport = createSecureTransport();

      Config.get().then((config) => {
        window.backgroundSeed = config.backgroundSeed;
        loadScripts(config);
      });

      intializeBar();
      handleResizeEvents();
    }
  });

function isWebExtensionPage () {
  const { protocol } = window.location;
  return protocol === 'chrome-extension:' || protocol === 'moz-extension:';
}

function isRoughlyEqual (a, b, diff = 0.1) {
  const keys = Object.keys(a);

  if (!isEqual(keys, Object.keys(b))) {
    return false;
  }

  return !keys.find((key) => {
    const valueA = a[key];
    const valueB = b[key];

    return Math.abs((valueB - valueA) / valueB) > diff;
  });
}

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

    parityBarElement.style.maxHeight = '100vh';

    // Resize the iframe if it's closing
    if (!opened) {
      const transitionHandler = () => {
        resizeAndClose();
        window.clearTimeout(safeTimeout);
        parityBarElement.removeEventListener('transitionend', transitionHandler);
      };

      // Check after 50ms if the Parity bar is back to its previous position
      // If it is, it means there haven't been any transition and we can safely
      // close it
      window.setTimeout(() => {
        const keys = [ 'height', 'width', 'left', 'right', 'top', 'bottom' ];
        const prevBoundingRect = pick(parityBarBoundingRect, keys);
        const currBoundingRect = pick(parityBarElement.getBoundingClientRect(), keys);

        if (isRoughlyEqual(prevBoundingRect, currBoundingRect, 0.2)) {
          transitionHandler();
        }
      }, 25);

      // In case we couldn't detect an animation end...
      const safeTimeout = window.setTimeout(() => {
        transitionHandler();
      }, 750);

      return parityBarElement.addEventListener('transitionend', transitionHandler);
    }

    window.parent.postMessage({
      type: EV_SIGNER_BAR,
      opened
    }, '*');
  });
}

function intializeBar (wait = 5000) {
  const parityBarElement = getParityBarElement();

  // Try again in 100ms if the ParityBar hasn't appeared yet
  // (typically, onload...)
  if ((!parityBarElement || !/parity/i.test(parityBarElement.innerText)) && wait > 0) {
    const timeout = 100;
    const nextWait = wait - timeout;

    return setTimeout(() => {
      intializeBar(nextWait);
    }, timeout);
  } else if (!parityBarElement) {
    console.error('the parity bar could not be found after 2s');
    closeIframe({
      bottom: 0,
      right: 0
    });
    return;
  }

  window.setTimeout(() => {
    resizeAndClose();
  }, 100);
}

/**
 * Resize and position the iframe according
 * to the Parity Bar style
 */
function resizeAndClose () {
  const parityBarElement = getParityBarElement();

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

  if (parseInt(iframeStyle.width) < BAR_MIN_WIDTH) {
    iframeStyle.width = `${BAR_MIN_WIDTH}px`;
  }

  if (parseInt(iframeStyle.height) < BAR_MIN_HEIGHT) {
    iframeStyle.height = `${BAR_MIN_HEIGHT}px`;
  }

  // Save closing position
  parityBarBoundingRect = parityBarElement.getBoundingClientRect();

  closeIframe(iframeStyle);
}

function closeIframe (iframeStyle) {
  window.parent.postMessage({
    type: EV_SIGNER_BAR,
    opened: false,
    style: iframeStyle
  }, '*');
}

/**
 * Loads ParityBar scripts from running node.
 */
function loadScripts (config) {
  // We need to use `port` here cause the response is asynchronous.
  const port = browser.runtime.connect({ name: 'barScripts' });
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

    const $allScripts = code.scripts.map(script => {
      const $script = document.createElement('script');
      $script.src = script;
      document.body.appendChild($script);
      return $script;
    });

    $allScripts[$allScripts.length - 1].addEventListener('load', () => {
      configureApi(config);
    });

    if (code.styles && code.styles.length) {
      code.styles.forEach(style => {
        const $styles = document.createElement('link');
        $styles.rel = 'stylesheet';
        $styles.href = style;
        document.head.appendChild($styles);
      });
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

  if (!window.secureApi) {
    return;
  }

  // Use the Secure API configure method if available
  if (typeof window.secureApi.configure === 'function') {
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
