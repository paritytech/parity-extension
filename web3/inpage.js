class Web3FrameProvider {
	id = 0;
	callbacks = {};

	constructor () {
		window.addEventListener('message', (ev) => {
			if (ev.source !== window) {
				return;
			}
			if (!ev.data.type || ev.data.type !== 'parity.web3.response') {
				return;
			}
			const { id, err, payload } = ev.data;
			const cb = this.callbacks[id];
			delete this.callbacks[id];

			if (!cb) {
				console.warn(`Unexpected response for ${id} received.`, ev.data);
				return;
			}

			cb(err, payload);
		});
	}

	sendAsync = (payload, cb) => {
		this.id += 1;
		this.callbacks[this.id] = cb;
		window.postMessage({
			type: 'parity.web3.request',
			id: this.id,
			payload: payload,
		}, '*');
	};

	send = (payload)  => {
		const { id, method, jsonrpc } = payload;
		if (method === 'eth_accounts') {
			const selectedAccount = localStorage.get('selectedAccount')
			const result = selectedAccount ? [selectedAccount] : []
			return { id, jsonrpc, result };
		}

		if (method === 'eth_coinbase') {
			const result = localStorage.get('selectedAccount') || '0x0000000000000000000000000000000000000000';
			return { id, jsonrpc, result };
		}

		if (method === 'eth_uninstallFilter') {
			this.sendAsync(payload, () => {})
			return {
				id, jsonrpc,
				result: true
			};
		}

		throw new Error('Async methods not supported.');
	};

	isConnected () {
		return true;
	}
}

if (!window.chrome || !window.chrome.extension) {
	console.log('Parity - Injecting Web3');
	window.web3 = {
		currentProvider: new Web3FrameProvider(),
	};

	// TODO [ToDr] Extract token
}
