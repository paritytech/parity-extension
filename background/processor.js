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

import { uniq } from 'lodash';

import Lookup from './lookup';

export const PROCESS_MATCHES = 'process_matches';

export default class Processor {

  process (input = {}) {
    const { data, type } = input;

    switch (type) {
      case PROCESS_MATCHES:
        return this.processMatches(data);

      default:
        return Promise.reject(`no actions matching  ${type}`);
    }
  }

  processMatches (matches) {
    console.log('received matches', matches);

    const emails = matches
      .map((match) => match.email)
      .filter((email) => email);

    const names = matches
      .map((match) => match.name)
      .filter((name) => name);

    const githubs = matches
      .filter((match) => match.github)
      .map((match) => match.name);

    const uniqEmails = uniq(emails);
    const uniqNames = uniq(names);
    const uniqGithubs = uniq(githubs);

    return Lookup.run({ emails: uniqEmails, names: uniqNames, githubs: uniqGithubs })
      .then((reversed) => reversed.filter((data) => data && data.address))
      .then((values) => {
        return values.reduce((object, data) => {
          if (data.email) {
            object[data.email] = { ...data };
          }

          if (data.name) {
            object[data.name] = { ...data };
          }

          return object;
        }, {});
      });
  }

}
