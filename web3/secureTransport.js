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

export function handleResizeEvents() {
  document.body.addEventListener('parity.bar.visibility', (ev) => {
    console.log(ev);
    ev.target.childNodes[0].style.maxHeight = '100vh';
    // TODO [ToDr] Use cross-frame communication to alter the frame
    window.parent.postMessage({
      type: 'parity.signer.bar',
      opened: ev.detail.opened
    }, '*');
  });
}
