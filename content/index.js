/* global chrome,NodeFilter,MutationObserver */

import { uniq } from 'lodash';
import uuid from 'uuid/v4';

import { extractPossibleMatches, findEmail } from './extractor';

const port = chrome.runtime.connect({ name: 'id' });
const messages = {};

function process (data) {
  const id = uuid();

  return new Promise((resolve, reject) => {
    // Reject after no answer in 5s
    const timeout = setTimeout(() => {
      reject(`the request #${id} timed out (no response from background)\n${JSON.stringify(data, null, 2)}`);
      delete messages[id];
    }, 5000);

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
    const extractions = extractPossibleMatches(node);

    if (extractions.length > 0) {
      matches = matches.concat(extractions);
    }
  }

  return matches;
}

function extractFromText (root = document.body) {
  const treeWalker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let matches = [];

  while (treeWalker.nextNode()) {
    const email = findEmail(treeWalker.currentNode.textContent);

    if (email) {
      matches = matches.concat(email);
    }
  }

  return matches;
}

function extract (root = document.body) {
  console.log('extracting from', root);

  const attrMatches = extractFromAttributes(root);
  const textMatches = extractFromText(root);
  const matches = [].concat(attrMatches, textMatches).filter((m) => m);
  const uniqMatches = uniq(matches);

  if (uniqMatches.length > 0) {
    console.log('got matches', uniqMatches);

    process({
      type: 'processText',
      data: uniqMatches
    })
    .then((result) => {
      console.log('result', result);
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
