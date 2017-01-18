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

import blockies from 'blockies';
import { h, render } from 'preact';
/** @jsx h */

import AccountCard from './components/account';

import Runner from './runner';
import { FETCH_IMAGE } from '../background/processor';

import styles from './styles.less';

export const AUGMENTED_NODE_ATTRIBUTE = 'data-parity-touched';

export default class Augmentor {

  static getBadge (badge, height) {
    const { src, title = '' } = badge;

    const image = new Image();

    image.src = src;
    image.title = title.toUpperCase();
    image.className = styles.badge;
    image.style = `height: ${height}px;`;

    return image;
  }

  static getToken (token) {
    const { TLA, balance, name } = token;

    const badge = Augmentor.getBadge(token, 32);
    // Display with 3 decimals
    const value = parseFloat(balance).toFixed(3);

    return `
      <span title="${name}" class="${styles.token}">
        ${badge.outerHTML}
        <span class="${styles.balance}">
          <span class="${styles.value}">${value}</span>
          <span class="${styles.tla}">${TLA}</span>
        </span>
      </span>
    `;
  }

  static getAccountCard (data, icon, badgesData, tokensData) {
    const { address, name } = data;

    const onClose = () => {
    console.warn('close');
    };

    return render((
      <AccountCard
        address={ address }
        badges={ badgesData }
        icon={ icon }
        name={ name }
        tokens={ tokensData }

        onClose={ onClose }
      />
    ));
  }

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

    const icon = blockies({
      seed: (address || '').toLowerCase(),
      size: 8,
      scale: 8
    }).toDataURL();

    Promise
      .all([ Promise.all(badgesPromises), Promise.all(tokensPromises) ])
      .then(([ badgesData, tokensData ]) => {
        const badgesElements = badgesData.map((badge) => Augmentor.getBadge(badge, height));

        // The Ethereum Addres Identity Icon
        const blockieElement = Augmentor.getBadge({ src: icon, title: address }, height);

        // The Badges container
        const badgesElement = document.createElement('span');
        badgesElement.className = styles.badges;
        badgesElements.forEach((elt) => badgesElement.appendChild(elt));

        // The Account Card
        const cardElement = Augmentor.getAccountCard(resolved[key], icon, badgesData, tokensData);

        // The main Container
        const iconsElement = document.createElement('span');
        iconsElement.setAttribute(AUGMENTED_NODE_ATTRIBUTE, true);
        iconsElement.className = styles.icons;
        iconsElement.appendChild(blockieElement);
        iconsElement.appendChild(badgesElement);
        iconsElement.appendChild(cardElement);

        iconsElement.onclick = (event) => {
          event.preventDefault();
          event.stopPropagation();

          const { currentTarget } = event;

          const selectedText = window.getSelection().toString();

          // Don't close if text is selected
          if (selectedText) {
            return false;
          }

          const classes = currentTarget.className.split(' ').map((className) => className.trim());

          if (classes.includes(styles.expanded)) {
            currentTarget.className = classes.filter((className) => className !== styles.expanded).join(' ');
          } else {
            currentTarget.className = classes.concat(styles.expanded).join(' ');
          }
        };

        const container = document.createElement('span');
        container.className = styles.container;

        container.appendChild(node.cloneNode(true));
        container.appendChild(iconsElement);

        node.parentElement.insertBefore(container, node);
        node.parentElement.removeChild(node);

        Augmentor.positionNode(badgesElement, iconsElement, { scale: 1.5, forceBottom: true });
        Augmentor.positionNode(cardElement, iconsElement, { scale: 4 });
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
