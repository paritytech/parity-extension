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

/* global NodeFilter,MutationObserver */
import { uniq } from 'lodash';

import { PROCESS_MATCHES } from '../background/processor';
import Extractor from './extractor';
import Augmentor from './augmentor';
import Runner from './runner';

// Process the page in stages.
// 0. We listen for possible changes
// 1. First we look for most likely matches <a href="mailto:..> and <a href="{user_profile}">
// 2. Then we process all text nodes

function extract (root = document.body) {
  const matches = Extractor.run(root);

  if (matches.length > 0) {
    console.log('got matches', matches);
    const uniqMatches = uniq(matches.map((match) => match.email));

    Runner.execute(PROCESS_MATCHES, uniqMatches)
    .then((resolved) => {
      console.log('received resolved', resolved);
      return Augmentor.run(matches, resolved);
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
