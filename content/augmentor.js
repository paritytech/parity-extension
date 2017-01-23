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
/** @jsx h */

import { AugmentedIcon } from './components';

import Runner from './runner';
import { FETCH_IMAGE } from '../background/processor';

import styles from './styles.less';

export const AUGMENTED_NODE_ATTRIBUTE = 'data-parity-touched';

export default class Augmentor {

  static getSafeNode (value, node) {
    const text = node.textContent || '';

    // Safe Node is if the node which inner text is only the value
    if (text.trim() === value) {
      return node;
    }

    const valueIndex = text.indexOf(value);

    if (valueIndex === -1) {
      return;
    }

    // If there are children, not yet at the base text node
    if (node.childElementCount) {
      const textNode = Array.prototype.slice
        .apply(node.childNodes)
        .find((node) => node.textContent.includes(value));

      return Augmentor.getSafeNode(value, textNode);
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

    return safeNode;
  }

  static augmentNode (key, node, resolved = {}) {
    if (!node || node.hasAttribute(AUGMENTED_NODE_ATTRIBUTE)) {
      return;
    }

    const rawText = node.textContent;
    const text = (rawText || '').trim();

    const data = resolved[key];
    node.setAttribute(AUGMENTED_NODE_ATTRIBUTE, true);

    // Don't augment empty nodes
    if (text.length === 0) {
      return;
    }

    if (!data) {
      return;
    }

    return Augmentor.fetchImages(data)
      .then(([ badges, tokens ]) => {
        const { address, name } = data;
        const { height = 16 } = node.getBoundingClientRect();
        const iconHeight = Math.min(height, 20);

        const augmentedIcon = render((
          <AugmentedIcon
            address={ address }
            badges={ badges }
            height={ iconHeight }
            name={ name }
            tokens={ tokens }
          />
        ));

        // Set the proper height if it has been modified
        if (height !== iconHeight) {
          node.style.height = `${height}px`;
        }

        // Add the right classe(s)
        styles.container
          .split(' ')
          .forEach((className) => {
            node.classList.add(className);
          });

        // Add the augmented icon
        node.insertBefore(augmentedIcon, node.childNodes[0]);
      })
      .catch((error) => {
        console.error('augmenting node', key, error);
      });
  }

  static fetchImages (data) {
    const { badges = [], tokens = [] } = data;

    const badgesPromises = badges
      .map((badge) => {
        return Runner.execute(FETCH_IMAGE, badge.img)
          .then((src) => ({ ...badge, src }));
      });

    const tokensPromises = tokens
      .map((token) => {
        return Runner.execute(FETCH_IMAGE, token.img)
          .then((src) => ({ ...token, src }));
      });

    return Promise.all([ Promise.all(badgesPromises), Promise.all(tokensPromises) ]);
  }

}
