/* global chrome */

console.log('Hello from background.');

chrome.runtime.onConnect.addListener(port => {
  console.assert(port.name === 'id');

  port.onMessage.addListener(msg => {
    console.log('Processing: ', msg);
    port.postMessage('Done');
  });
});
