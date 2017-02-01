export const TRANSPORT_UNINITIALIZED = 'Transport uninitialized';
export const UI = '127.0.0.1:8180';
export const DAPPS = '127.0.0.1:8080';

export const EV_WEB3_REQUEST = 'parity.web3.request';
export const EV_WEB3_RESPONSE = 'parity.web3.response';
export const EV_WEB3_ACCOUNTS_REQUEST = 'parity.web3.accounts.request';
export const EV_WEB3_ACCOUNTS_RESPONSE = 'parity.web3.accounts.response';
export const EV_TOKEN = 'parity.token';
export const EV_SIGNER_BAR = 'parity.signer.bar';
export const EV_BAR_CODE = 'parity.signer.bar.code';

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

export function isEnabled () {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ action: 'isEnabled' }, (enabled) => {
      resolve(enabled);
    });
  });
}
