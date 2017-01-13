/* global chrome */

chrome.runtime.onConnect.addListener((port) => {
  console.assert(port.name === 'id');

  port.onMessage.addListener((msg) => {
    let message;

    try {
      message = typeof msg === 'string'
        ? JSON.parse(msg)
        : msg;
    } catch (error) {
      console.error('could not parse message', msg);
      return;
    }

    const { id, data } = message;

    process(data)
      .then((result) => {
        port.postMessage({
          id, result
        });
      })
      .catch((error) => {
        port.postMessage({
          id, error
        });
      });
  });
});

function process (data) {
  return new Promise((resolve, reject) => {
    console.log('processing', data);
    resolve('result');
  });
}
