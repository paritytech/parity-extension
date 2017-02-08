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

import { h, render } from 'preact';

import { AugmentedIcon } from './components';
import { EXTRACT_TYPE_HANDLE, EXTRACT_TYPE_GITHUB } from './extraction';
import { FETCH_IMAGE } from '../background/processor';

export const AUGMENTED_NODE_ATTRIBUTE = 'data-parity-touched';

export default class Augmentor {

  store = null;

  constructor (store) {
    this.store = store;
  }

  getSafeNodes (extraction, node) {
    const { text } = extraction;
    const content = node.textContent || '';

    // Already the safe node if the inner text is only the value
    if (content.trim() === text.trim()) {
      return [ node ];
    }

    const safeNodes = [];
    let safeNode = this.getSafeNode(text, node);

    while (safeNode) {
      safeNodes.push(safeNode.node);
      safeNode = this.getSafeNode(text, safeNode.after);
    }

    return safeNodes;
  }

  getSafeNode (value, node) {
    const text = node.textContent || '';

    const valueIndex = text.indexOf(value);

    if (valueIndex === -1) {
      return;
    }

    // If there are children, not yet at the base text node
    if (node.childElementCount) {
      const textNode = Array.prototype.slice
        .apply(node.childNodes)
        .find((node) => node.textContent.includes(value));

      const safeNode = this.getSafeNode(value, textNode);
      return safeNode && safeNode.node;
    }

    const beforeText = text.slice(0, valueIndex);
    const afterText = text.slice(valueIndex + value.length);

    const beforeNode = document.createTextNode(beforeText);
    const afterNode = document.createTextNode(afterText);

    const safeNode = document.createElement('span');
    safeNode.innerText = value;

    if (node.nodeName === '#text') {
      const nextNode = document.createElement('span');
      nextNode.appendChild(beforeNode);
      nextNode.appendChild(safeNode);
      nextNode.appendChild(afterNode);
      node.parentElement.replaceChild(nextNode, node);
    } else {
      // Don't replace the node if it's not a text node
      // in order to keep bindings
      node.innerHTML = '';
      node.appendChild(beforeNode);
      node.appendChild(safeNode);
      node.appendChild(afterNode);
    }

    return { after: afterNode, node: safeNode };
  }

  augmentNode (extraction, node) {
    if (!node || node.hasAttribute(AUGMENTED_NODE_ATTRIBUTE)) {
      return;
    }

    const rawText = node.textContent;
    const text = (rawText || '').trim();

    const data = this.store.accounts.find(extraction.address);
    node.setAttribute(AUGMENTED_NODE_ATTRIBUTE, true);

    // Don't augment empty nodes
    if (text.length === 0) {
      return;
    }

    if (!data) {
      return;
    }

    return this.fetchImages(data)
      .then(([ badges, tokens ]) => {
        const { address, email, name } = data;

        // Compute the height of the text, which should be the
        // height of the element minus the paddings
        const { height = 16 } = node.getBoundingClientRect();
        const { lineHeight, paddingTop, paddingBottom } = window.getComputedStyle(node);

        let padTop = 0;
        let padBottom = 0;
        let nodeLineHeight = height;
        const pxRegex = /^(\d+)px$/i;

        if (pxRegex.test(paddingTop)) {
          padTop = parseFloat(pxRegex.exec(paddingTop)[1]);
        }

        if (pxRegex.test(paddingBottom)) {
          padBottom = parseFloat(pxRegex.exec(paddingBottom)[1]);
        }

        if (pxRegex.test(lineHeight)) {
          nodeLineHeight = parseFloat(pxRegex.exec(lineHeight)[1]);
        }

        const nodeHeight = height - padTop - padBottom;
        const iconHeight = Math.min(nodeHeight, 20);

        const safe = extraction.type !== EXTRACT_TYPE_HANDLE;

        // If from Github, display the Github handle if
        // no name linked
        const displayName = extraction.type === EXTRACT_TYPE_GITHUB
          ? name || extraction.match
          : name;

        const augmentedIcon = render((
          <AugmentedIcon
            address={ address }
            badges={ badges }
            email={ email }
            height={ iconHeight }
            name={ displayName }
            safe={ safe }
            tokens={ tokens }
          />
        ));

        // Set the proper height if it has been modified
        augmentedIcon.style.top = ((nodeLineHeight - iconHeight) / 2 - padTop) + 'px';

        node.insertAdjacentElement('afterbegin', augmentedIcon);
      })
      .catch((error) => {
        console.error('augmenting node', extraction.toObject(), error);
      });
  }

  fetchImages (data) {
    const { badges = [], tokens = [] } = data;
    const { runner } = this.store;

    const badgesPromises = badges
      .map((badge) => {
        return runner.execute(FETCH_IMAGE, badge.img)
          .then((src) => ({ ...badge, src }));
      });

    const tokensPromises = tokens
      .map((token) => {
        return runner.execute(FETCH_IMAGE, token.img)
          .then((src) => ({ ...token, src }));
      });

    return Promise.all([ Promise.all(badgesPromises), Promise.all(tokensPromises) ]);
  }

}
