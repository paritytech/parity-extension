// Copyright 2015, 2016 Parity Technologies (UK) Ltd.
// This file is part of Parity.

// Parity is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// Parity is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with Parity.  If not, see <http://www.gnu.org/licenses/>.

import { Abi, Api } from '@parity/parity.js';

import EmailVerifiactionABI from '../abi/email-verification.json';

export const PROCESS_MATCHES = 'process_matches';

export default class Processor {

	constructor () {
		const transport = new Api.Transport.Http('http://localhost:8545');
		this.api = new Api(transport);

		const emailContractAddress = '0x4A99350b039068fD326a318C599Be2E09E657D4A';
		this.emailContract = this.api.newContract(EmailVerifiactionABI, emailContractAddress);
	}

	process (data = {}) {
		switch (data.type) {
			case PROCESS_MATCHES:
				return this.processMatches(data.data);

			default:
				return Promise.reject(`no actions matching  ${data.type}`);
		}
	}

	processMatches (matches) {
		console.log('received matches', matches);

		const promises = matches.map((email) => this.reverseEmail(email));

		return Promise
			.all(promises)
			.then((reversed) => {
				return reversed.filter((data) => data);
			})
			.then((values) => {
				return values.reduce((object, data) => {
					object[data.email] = { ...data };
					return object;
				}, {});
			});
	}

	reverseEmail (email) {
		const emailHash = this.api.util.sha3(email);

		return this.emailContract
			.instance.reverse
			.call({}, [ emailHash ])
			.then((address) => {
				console.log(email, emailHash, address);

				if (!address || /^(0x)?0*$/.test(address)) {
					return null;
				}

				return {
					address, email
				};
			})
	}
}
