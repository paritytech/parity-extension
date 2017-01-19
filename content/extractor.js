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

// Given DOM element returns array of possible id-links to resolve.

import Augmentor, { AUGMENTED_NODE_ATTRIBUTE } from './augmentor';
import { PROCESS_MATCHES } from '../background/processor';
import Runner from './runner';
import Socials from './socials';

export const TAGS_BLACKLIST = [ 'script' ];

const EMAIL_PATTERN = /([^\s@]+@[^\s@]+\.[a-z]+)/i;
const MAILTO_PATTERN = new RegExp(`mailto:${EMAIL_PATTERN.source}`, 'i');

export default class Extractor {

  static run (root = document.body) {
    Extractor.getAttributeNodes(root)
      .then(() => Extractor.getTextNodes(root));
  }

  static getAttributeNodes (root = document.body) {
    const treeWalker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT);
    const promises = [];

    while (treeWalker.nextNode()) {
      const node = treeWalker.currentNode;

      if (node.hasAttribute(AUGMENTED_NODE_ATTRIBUTE)) {
        continue;
      }

      const extractions = Extractor.fromAttributes(node);

      if (extractions.length === 0) {
        continue;
      }

      const promise = Runner.execute(PROCESS_MATCHES, extractions)
        .then((result = {}) => {
          const keys = Object.keys(result);

          if (keys.length === 0) {
            return null;
          }

          const key = keys[0];
          return Augmentor.augmentNode(key, node, result);
        })
        .catch((error) => {
          console.error('extracting', node, error);
        });

      promises.push(promise);
    }

    return Promise.all(promises);
  }

  static getTextNodes (root = document.body) {
    const treeWalker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const promises = [];

    while (treeWalker.nextNode()) {
      const node = treeWalker.currentNode;
      let parentNode = node.parentElement;

      // Don't extract from blacklisted DOM Tags
      if (TAGS_BLACKLIST.includes(parentNode.tagName.toLowerCase())) {
        continue;
      }

      if (parentNode.hasAttribute(AUGMENTED_NODE_ATTRIBUTE)) {
        continue;
      }

      const text = node.textContent;
      const extractions = Extractor.fromText(text);

      if (extractions.length === 0) {
        continue;
      }

      const promise = Runner.execute(PROCESS_MATCHES, extractions)
        .then((result = {}) => {
          extractions.forEach((extraction) => {
            const { key } = extraction;

            if (!result[key]) {
              return null;
            }

            const safeNode = Augmentor.getSafeNode(key, parentNode);
            console.warn(key, result, safeNode, parentNode);
            parentNode = safeNode.parentElement;
            return Augmentor.augmentNode(key, safeNode, result);
          });
        })
        .catch((error) => {
          console.error('extracting', node, error);
        });

      promises.push(promise);
    }

    return Promise.all(promises);
  }

  static fromAttributes ($dom) {
    const tag = $dom.tagName.toLowerCase();

    if (!tag || TAGS_BLACKLIST.includes(tag)) {
      return [];
    }

    const { href, title, alt } = $dom;
    const matches = [];

    if (href) {
      push(matches, findMailto(href));
      push(matches, Socials.extract(href));
    }

    if (title) {
      push(matches, findEmail(title));
    }

    if (alt) {
      push(matches, findEmail(title));
    }

    return matches;
  }

  /**
   * Extract matches from the given text
   *
   * @param  { String } text                  - The text to match against
   * @return {[{ key: String, ...other }]}   - The results as an Array of Objects
   */
  static fromText (text) {
    const emails = findEmails(text);
    const socials = Socials.extract(text);

    const values = emails.map((data) => ({ email: data.email, key: data.email }));

    if (socials) {
      values.push({ key: socials.name, ...socials });
    }

    return values;
  }

}

function findMailto (val) {
  if (MAILTO_PATTERN.test(val)) {
    const match = MAILTO_PATTERN.exec(val);
    return { email: match[1] };
  }

  return null;
}

function findEmail (val) {
  if (EMAIL_PATTERN.test(val)) {
    const match = EMAIL_PATTERN.exec(val);
    return { email: match[1] };
  }

  return null;
}

function findEmails (text) {
  const regex = new RegExp(EMAIL_PATTERN.source, 'gi');
  const emails = [];
  let match = regex.exec(text);

  while (match) {
    emails.push({ email: match[1] });
    match = regex.exec(text);
  }

  return emails;
}

function push (array, val) {
  if (val) {
    array.push(val);
  }
}
