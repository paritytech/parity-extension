/**
 * Creates a secureTransport, that can be used by injected ParityBar
 */
export function createSecureTransport() {
  let id = 0;
  const data = {};
  const port = chrome.runtime.connect({ name: 'secureApi' });

  port.onMessage.addListener((msg) => {
    const { id, err, payload } = msg;
    if (!data[id]) {
      console.warn('Unexpected response received: ', id, msg);
      return;
    }
    const { resolve, reject, method, params } = data[id];
    delete data[id];

    console.log(`Resolving ${method}(${params}) = `, payload);

    if (err || payload.error) {
      reject(err || payload.error);
    } else {
      resolve(payload.result);
    }
  });

  return {
    execute(method, ...params) {
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
          type: 'parity.web3.request',
          payload: request
        });
      });
    },
    on() {
      console.log('listener', arguments);
    },
    get isConnected () {
      return true;
    }
  };
}

/**
 *  Propagates opening events to upper frame
 */
export function handleResizeEvents() {
  document.body.addEventListener('parity.bar.visibility', (ev) => {
    ev.target.childNodes[0].style.maxHeight = '100vh';
    window.parent.postMessage({
      type: 'parity.signer.bar',
      opened: ev.detail.opened
    }, '*');
  });
}

/**
 * Loads ParityBar scripts from running node.
 */
export function loadScripts() {
  // We need to use `port` here cause the response is asynchronous.
  const port = chrome.runtime.connect({ name: 'barScripts' });
  port.onMessage.addListener((code) => {
    const $script = document.createElement('script');
    const $styles = document.createElement('link');

    $script.src = code.scripts;
    $styles.rel = 'stylesheet';
    $styles.href = code.styles;
    document.head.appendChild($styles);
    document.body.appendChild($script);
  });

  port.postMessage({
    type: 'parity.bar.code'
  });
}


