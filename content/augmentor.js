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

  static augmentNode (key, node, resolved = {}) {
    if (!node || node.getAttribute(AUGMENTED_NODE_ATTRIBUTE) === 'true') {
      return;
    }

    node.setAttribute(AUGMENTED_NODE_ATTRIBUTE, true);

    if (!resolved[key]) {
      return;
    }

    const { address, badges = [], tokens = [] } = resolved[key];

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

    const { height = 16 } = node.getBoundingClientRect();

    Promise
      .all([ Promise.all(badgesPromises), Promise.all(tokensPromises) ])
      .then(([ badgesData, tokensData ]) => {
        // The main Container
        const container = render((
          <AugmentedIcon
            address={ address }
            badges={ badgesData }
            height={ height }
            tokens={ tokensData }
          />
        ));

        container.insertAdjacentElement('afterbegin', node.cloneNode(true));
        node.insertAdjacentElement('afterend', container);
        node.parentElement.removeChild(node);

        // Augmentor.positionNode(badgesElement, iconsElement, { scale: 1.5, forceBottom: true });
        // Augmentor.positionNode(cardElement, iconsElement, { scale: 4 });
      });
  }

  static positionNode (node, container, options = {}) {
    const { scale = 1.5, offset = 5, forceBottom = false } = options;

    const nodeRect = node.getBoundingClientRect();

    const pageHeight = window.innerHeight;
    const pageWidth = window.innerWidth;

    const center = {
      x: nodeRect.left + nodeRect.width / 2,
      y: nodeRect.top + nodeRect.height / 2
    };

    const scaledClientRect = {
      left: center.x - scale * (nodeRect.width / 2),
      right: center.x + scale * (nodeRect.width / 2),
      top: center.y - scale * (nodeRect.height / 2),
      bottom: center.y + scale * (nodeRect.height / 2),

      height: scale * nodeRect.height,
      width: scale * nodeRect.width
    };

    // If 5px or less of right border
    if (scaledClientRect.right >= pageWidth - offset) {
      const nextLeft = pageWidth - offset - scaledClientRect.width;
      node.style.left = `${nextLeft}px`;
    }

    // If 5px of less of left border
    if (scaledClientRect.left <= offset) {
      const nextLeft = offset;
      node.style.left = `${nextLeft}px`;
    }

    // If 5px or less of right border
    if (scaledClientRect.bottom >= pageHeight - offset) {
      const nextTop = pageHeight - offset - scaledClientRect.height;
      node.style.top = `${nextTop}px`;
    }

    // If 5px of less of left border
    if (scaledClientRect.top <= offset) {
      if (forceBottom) {
        const nextTop = scaledClientRect.height + 2 * offset + container.getBoundingClientRect().height;
        node.style.top = `${nextTop}px`;
        node.className += ` ${styles.fromBottom}`;
      } else {
        const nextTop = scaledClientRect.height / 2 + offset;
        node.style.top = `${nextTop}px`;
      }
    }
  }

  static run (matches, resolved = {}) {
    // Use the attributes matcher first
    const attributesMatches = matches.filter((match) => match.from === 'attributes');
    const textMatches = matches.filter((match) => match.from === 'text');

    attributesMatches
      .forEach((match) => {
        const { email, node } = match;
        Augmentor.augmentNode(email, node, resolved);
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

        Augmentor.augmentNode(email, safeNode, resolved);
      });
  }

}
