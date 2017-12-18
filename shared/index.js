export const TRANSPORT_UNINITIALIZED = 'Transport uninitialized';

export const EV_WEB3_REQUEST = 'parity.web3.request';
export const EV_WEB3_RESPONSE = 'parity.web3.response';
export const EV_WEB3_ACCOUNTS_REQUEST = 'parity.web3.accounts.request';
export const EV_WEB3_ACCOUNTS_RESPONSE = 'parity.web3.accounts.response';
export const EV_TOKEN = 'parity.token';
export const EV_SIGNER_BAR = 'parity.signer.bar';
export const EV_BAR_CODE = 'parity.signer.bar.code';

export const isProd = process.env.NODE_ENV === 'production';
export const isEmbedDev = process.env.EMBED === '1';
export const browser = global.browser || global.chrome;

/**
 * Exponential Timeout for Retries
 *
 * @see http://dthain.blogspot.de/2009/02/exponential-backoff-in-distributed.html
 */
export function getRetryTimeout (retries) {
  // R between 1 and 2
  const R = Math.random() + 1;
  // Initial timeout (100ms)
  const T = 100;
  // Exponential Factor
  const F = 2;
  // Max timeout (4s)
  const M = 4000;
  // Current number of retries
  const N = retries;

  return Math.min(R * T * Math.pow(F, N), M);
}

function asPromise (action, data = {}) {
  return new Promise((resolve, reject) => {
    browser.runtime.sendMessage({
      action,
      data
    }, (response) => {
      if (!response && browser.runtime.lastError) {
        console.warn('Rejected response: ', action, data);
        reject(browser.runtime.lastError);
      } else {
        resolve(response);
      }
    });
  });
}

export function isAugmentationEnabled () {
  return asPromise('isAugmentationEnabled');
}

export function isIntegrationEnabled () {
  return asPromise('isIntegrationEnabled');
}

export function getNodeStatus () {
  return asPromise('getNodeStatus');
}

export function getNodeURL () {
  return asPromise('getNodeURL');
}

export function getUI () {
  return asPromise('getUI');
}

export function reload () {
  return asPromise('reload');
}

export function clearCache () {
  return asPromise('clearCache');
}

export function getChainName () {
  return asPromise('getChainName');
}

export function analytics (data) {
  return asPromise('analytics', data);
}

export function withDomain (url, domain = 'http://', alt = 'https://') {
  if (url.startsWith(domain) || url.startsWith(alt)) {
    return url;
  }

  return `${domain}${url}`;
}

export function setInstalled () {
  // Indicate that the extension is installed.
  window[Symbol.for('parity.extension')] = {
    version: require('../package.json').version
  };
}
