export const TRANSPORT_UNINITIALIZED = 'Transport uninitialized';

export const EV_WEB3_REQUEST = 'parity.web3.request';
export const EV_WEB3_RESPONSE = 'parity.web3.response';
export const EV_WEB3_ACCOUNTS_REQUEST = 'parity.web3.accounts.request';
export const EV_WEB3_ACCOUNTS_RESPONSE = 'parity.web3.accounts.response';
export const EV_TOKEN = 'parity.token';
export const EV_SIGNER_BAR = 'parity.signer.bar';
export const EV_BAR_CODE = 'parity.signer.bar.code';
export const EV_NODE_URL = 'parity.inject.node.url';

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

export function isAugmentationEnabled () {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ action: 'isAugmentationEnabled' }, (enabled) => {
      resolve(enabled);
    });
  });
}

export function isIntegrationEnabled () {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ action: 'isIntegrationEnabled' }, (enabled) => {
      resolve(enabled);
    });
  });
}

export function getNodeStatus () {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ action: 'getNodeStatus' }, (status) => {
      resolve(status);
    });
  });
}

export function getNodeURL () {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ action: 'getNodeURL' }, (url) => {
      resolve(url);
    });
  });
}

export function getUI () {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ action: 'getUI' }, (url) => {
      resolve(url);
    });
  });
}

export function reload () {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ action: 'reload' });
    resolve();
  });
}

export function clearCache () {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ action: 'clearCache' });
    resolve();
  });
}

export function getChainName () {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ action: 'getChainName' }, (chainName) => {
      resolve(chainName);
    });
  });
}
