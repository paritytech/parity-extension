import styles from './styles.less';

import { createSecureTransport } from './secureTransport';

// TODO [ToDr] Re-using same file to have it processed by webpack
if (window.location.protocol === 'chrome-extension:') {
	window.secureTransport = createSecureTransport();
} else {
	const script = document.createElement('script');
	script.src = chrome.extension.getURL('web3/inpage.js');
	document.head.insertBefore(script, document.head.childNodes[0]);

	const port = chrome.runtime.connect({ name: 'web3' });

	// process requests
	window.addEventListener('message', (ev) => {
		if (ev.source !== window) {
			return;
		}
		if (!ev.data.type) {
			return;
		}
		const { type } = ev.data;

		if (type === 'parity.web3.request') {
			// Inject iframe only if the page is using Web3
			injectIframe();
			port.postMessage(ev.data);
			return;
		}
		if (type === 'parity.token') {
			console.log('Sending token', ev.data.token);
			chrome.runtime.sendMessage({
				token: ev.data.token
			});
		}
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

	let iframeInjected = false;
	function injectIframe() {
		if (iframeInjected) {
			return;
		}

		iframeInjected = true;
		const iframe = document.createElement('iframe');
		console.log(styles);
		iframe.className = styles.iframe__main;
		iframe.src = chrome.extension.getURL('web3/embed.html');
		document.body.appendChild(iframe);
	}
}
