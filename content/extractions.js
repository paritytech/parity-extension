// Copyright 2015-2017 Parity Technologies (UK) Ltd.
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

import Extraction, {
  EXTRACT_TYPE_EMAIL,
  EXTRACT_TYPE_HANDLE,
  EXTRACT_TYPE_GITHUB
} from './extraction';

import Socials from './socials';

export const TAGS_BLACKLIST = [ 'script' ];

const EMAIL_PATTERN = /([^\s@]+@[^\s@]+\.[a-z]+)/i;
const MAILTO_PATTERN = new RegExp(`mailto:${EMAIL_PATTERN.source}`, 'i');

export default class Extractions {

  extractions = [];

  get addresses () {
    const addresses = this.extractions
      .map((extraction) => extraction.address)
      .filter((address) => address);

    return uniq(addresses);
  }

  map (func) {
    return this.extractions.map(func.bind(this));
  }

  /**
   * Extract matches from the given node's attributes
   */
  fromAttributes ($dom) {
    const tag = $dom.tagName.toLowerCase();

    if (!tag || TAGS_BLACKLIST.includes(tag)) {
      return [];
    }

    const { href, email, title, alt } = $dom;

    if (href) {
      this.push(findMailto(href), { type: EXTRACT_TYPE_EMAIL, priority: 1 });
      // push(matches, Socials.extract(href), EXTRACT_FROM_ATTRIBUTES, EXTRACT_TYPE_EMAIL);
    }

    // Try to find email in these DOM attributes,
    // prioritizing the `email` attribute
    [ email, alt, title ]
      .filter((value) => value)
      .forEach((value, index) => {
        this.push(findEmail(value), { type: EXTRACT_TYPE_EMAIL, priority: 2 + index });
      });

    return this;
  }

  /**
   * Extract matches from the given text
   */
  fromText (text) {
    const emails = findEmails(text);
    // const socials = Socials.extract(text);

    emails.forEach((email) => {
      this.push(email, { text: email, type: EXTRACT_TYPE_EMAIL });
    });

    return this;
  }

  /**
   * Is the extraction list empty?
   *
   * @return {Boolean}
   */
  empty () {
    return this.extractions.length === 0;
  }

  /**
   * Returns the first extraction with an address
   * (ie. a result), sorted by their priority.
   */
  first () {
    const extraction = this.extractions
      .sort((exA, exB) => {
        return exB.priority - exA.priority;
      })
      .find((extraction) => {
        return extraction.address;
      });

    return extraction;
  }

  /**
   * Is the given match and type already included in the extractions?
   *
   * @return {Boolean}
   */
  includes (match, type) {
    return !!this.extractions.find((extraction) => {
      return extraction.type === type && extraction.match === match;
    });
  }

  /**
   * Push a new match to the extractions list, if
   * truthy match and if not already included in
   * the list.
   */
  push (match, { type, text = '', priority = 0 }) {
    if (!match) {
      return this;
    }

    if (this.includes(match, type)) {
      return this;
    }

    const extraction = new Extraction({ match, text, type, priority });
    this.extractions.push(extraction);

    return this;
  }

  /**
   * Replace the current extractions with new ones
   */
  replaceWith (nextExtractions) {
    this.extractions = nextExtractions.extractions.slice();
  }

  toObject () {
    return this.extractions.map((extraction) => extraction.toObject());
  }

  static fromObject (data) {
    const extractions = data.map((extraction) => Extraction.fromObject(extraction));
    const self = new Extractions();

    self.extractions = extractions;
    return self;
  }

}

function findMailto (val) {
  if (MAILTO_PATTERN.test(val)) {
    const match = MAILTO_PATTERN.exec(val);
    return match[1];
  }

  return null;
}

function findEmail (val) {
  if (EMAIL_PATTERN.test(val)) {
    const match = EMAIL_PATTERN.exec(val);
    return match[1];
  }

  return null;
}

function findEmails (text) {
  const regex = new RegExp(EMAIL_PATTERN.source, 'gi');
  const emails = [];
  let match = regex.exec(text);

  while (match) {
    emails.push(match[1]);
    match = regex.exec(text);
  }

  return emails;
}
