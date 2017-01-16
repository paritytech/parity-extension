const script = document.createElement('script');
script.src = chrome.extension.getURL('web3/inpage.js');
document.head.insertBefore(script, document.head.childNodes[0]);

const port = chrome.runtime.connect({ name: 'web3' });

// process requests
window.addEventListener('message', (ev) => {
	if (ev.source !== window) {
		return;
	}
	if (!ev.data.type || ev.data.type !== 'parity.web3.request') {
		return;
	}
	port.postMessage(ev.data);
});

port.onMessage.addListener((msg) => {
	const { id, err, payload } = msg;
	window.postMessage({
		type: 'parity.web3.response',
		id,
		err,
		payload
	}, '*');
});
