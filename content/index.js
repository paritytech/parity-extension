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

/* global chrome,NodeFilter,MutationObserver */

import { uniq } from 'lodash';
import uuid from 'uuid/v4';

import { PROCESS_MATCHES } from '../background/processor';
import Extractor, { TAGS_BLACKLIST } from './extractor';

const port = chrome.runtime.connect({ name: 'id' });
const messages = {};

function run (data) {
  const id = uuid();

  return new Promise((resolve, reject) => {
    // Reject after no answer in 5s
    const timeout = setTimeout(() => {
      reject(`the request #${id} timed out (no response from background)\n${JSON.stringify(data, null, 2)}`);
      delete messages[id];
    }, 10 * 1000);

    const message = {
      id, data,
      timeout, resolve, reject
    };

    // Add message to the queue
    messages[id] = message;

    // postMessage to the background script
    port.postMessage({ id, data });
  });
}

// Listen for responses
port.onMessage.addListener((msg) => {
  let data;

  try {
    data = typeof msg === 'string'
      ? JSON.parse(msg)
      : msg;
  } catch (error) {
    console.error('could not parse message', msg);
    return;
  }

  const { id, result, error } = data;
  const message = messages[id];

  if (!message) {
    console.warn('got unexpected response', msg);
    return;
  }

  if (result) {
    message.resolve(result);
  } else {
    message.reject(error);
  }

  delete messages[id];
});

// Process the page in stages.
// 0. We listen for possible changes
// 1. First we look for most likely matches <a href="mailto:..> and <a href="{user_profile}">
// 2. Then we process all text nodes

function extractFromAttributes (root = document.body) {
  const treeWalker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT);
  let matches = [];

  while (treeWalker.nextNode()) {
    const node = treeWalker.currentNode;

    if (node.getAttribute('data-parity-touched') === 'true') {
      continue;
    }

    const extractions = Extractor.fromAttributes(node);

    if (extractions.length === 0) {
      continue;
    }

    const newMatches = extractions.map((email) => ({
      email, node, from: 'attributes'
    }));

    matches = matches.concat(newMatches);
  }

  return matches;
}

function extractFromText (root = document.body) {
  const treeWalker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let matches = [];

  while (treeWalker.nextNode()) {
    const node = treeWalker.currentNode;
    const parentNode = node.parentElement;

    if (parentNode.getAttribute('data-parity-touched') === 'true') {
      continue;
    }

    // Don't extract from blacklisted DOM Tags
    if (TAGS_BLACKLIST.includes(parentNode.tagName.toLowerCase())) {
      continue;
    }

    const extractions = Extractor.fromText(node.textContent);

    if (extractions.length === 0) {
      continue;
    }

    const newMatches = extractions.map((email) => ({
      email, node: parentNode, from: 'text'
    }));

    matches = matches.concat(newMatches);
  }

  return matches;
}

function augmentNode (email, node, resolved = {}) {
  if (!node || node.getAttribute('data-parity-touched') === 'true') {
    return;
  }

  node.setAttribute('data-parity-touched', true);

  if (!resolved[email]) {
    return;
  }

  const { address } = resolved[email];

  node.setAttribute('data-parity-touched', true);
  node.outerHTML += `<span data-parity-touched="true"> (${address})</span>`;
}

function augment (matches, resolved = {}) {
  // Use the attributes matcher first
  const attributesMatches = matches.filter((match) => match.from === 'attributes');
  const textMatches = matches.filter((match) => match.from === 'text');

  attributesMatches
    .forEach((match) => {
      const { email, node } = match;
      augmentNode(email, node, resolved);
    });

  textMatches
    .forEach((match) => {
      const { email, node } = match;

      // Safe Node is if the node which inner text is only the email address
      let safeNode = node.innerText.trim() === email
        ? node
        : null;

      // If it has more text, try to separate in SPANs
      if (!safeNode) {
        const emailIndex = node.innerText.indexOf(email);

        if (emailIndex === -1) {
          return;
        }

        const beforeText = node.innerText.slice(0, emailIndex);
        const afterText = node.innerText.slice(emailIndex + email.length);

        node.innerHTML = `${beforeText}<span>${email}</span>${afterText}`;
        safeNode = node.querySelector('span');
      }

      if (!safeNode) {
        return;
      }

      augmentNode(email, safeNode, resolved);
    })
}

function extract (root = document.body) {
  const attrMatches = extractFromAttributes(root);
  const textMatches = extractFromText(root);

  const matches = [].concat(attrMatches, textMatches).filter((m) => m);

  if (matches.length > 0) {
    console.log('got matches', matches);
    const uniqMatches = uniq(matches.map((match) => match.email));

    run({
      type: PROCESS_MATCHES,
      data: uniqMatches
    })
    .then((resolved) => {
      console.log('received resolved', resolved);
      return augment(matches, resolved);
    })
    .catch((error) => {
      console.error(error);
    });
  }
}

// Observe later changes
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    const { addedNodes } = mutation;

    if (!addedNodes || addedNodes.length === 0) {
      return;
    }

    const ignoreNode = Array.prototype.slice.apply(addedNodes).find((node) => {
      return typeof node.getAttribute === 'function' && node.getAttribute('data-parity-ignore') === 'true';
    });

    if (ignoreNode) {
      return;
    }

    addedNodes.forEach((node) => {
      extract(node);
    });
  });
});

observer.observe(document.body, {
  attributes: true,
  childList: true,
  characterData: true,
  subtree: true
});

// Start processing
extract();
