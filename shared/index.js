export const TRANSPORT_UNINITIALIZED = 'Transport uninitialized';
export const UI = '127.0.0.1:8180';
export const ACCOUNTS_REQUEST = 'parity.background.accounts';

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
