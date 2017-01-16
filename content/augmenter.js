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

const SVG_MATCH = /.svg(\?.+)?$/i;

import styles from './styles.css';
console.warn(styles);

export default class Augmenter {

  static augmentNode (key, node, resolved = {}) {
    if (!node || node.getAttribute('data-parity-touched') === 'true') {
      return;
    }

    node.setAttribute('data-parity-touched', true);

    if (!resolved[key]) {
      return;
    }

    const { address, badges } = resolved[key];

    const badgesPromises = badges.map((badge) => {
      return fetch(badge.img)
        .then((response) => {
          if (SVG_MATCH.test(badge.img)) {
            return response.text().then((data) => {
              return new window.Blob([ data ], {
                type: 'image/svg+xml;charset=utf-8'
              });
            });
          }

          return response.blob();
        })
        .then((data) => ({ ...badge, data }));
    });

    const { height = 16 } = node.getBoundingClientRect();

    Promise
      .all(badgesPromises)
      .then((badgesData) => {
        const badgesHTML = badgesData.map((badge) => {
          const { data, img, title } = badge;

          const image = new Image();

          const url = window.URL.createObjectURL(data);
          image.src = url;
          image.title = title;
          image.className = styles.badge;
          image.style = `height: ${height}px;`;

          image.addEventListener('load', () => {
            window.URL.revokeObjectURL(url);
          });

          image.addEventListener('error', (error) => {
            console.error(`error loading ${img}`, error);
            window.URL.revokeObjectURL(url);
          });

          return image.outerHTML;
        }).join('');

        node.className += ` ${styles.container}`;
        node.innerHTML += `
          <span data-parity-touched="true" class="${styles.badges}">
            ${badgesHTML}
          </span>
        `;
      });
  }

  static run (matches, resolved = {}) {
    // Use the attributes matcher first
    const attributesMatches = matches.filter((match) => match.from === 'attributes');
    const textMatches = matches.filter((match) => match.from === 'text');

    attributesMatches
      .forEach((match) => {
        const { email, node } = match;
        Augmenter.augmentNode(email, node, resolved);
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

        Augmenter.augmentNode(email, safeNode, resolved);
      });
  }

}
