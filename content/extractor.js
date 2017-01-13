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
export function extractPossibleMatches ($dom) {
  const { href, title, alt } = $dom;
  const matches = [];

  if (href) {
    push(matches, findMailto(href));
  }

  if (title) {
    push(matches, findEmail(title));
  }

  if (alt) {
    push(matches, findEmail(title));
  }

  return matches;
}

const EMAIL_PATTERN = /([^\s@]+@[^\s@]+\.[^\s@]+)/;
const MAILTO_PATTERN = new RegExp(`mailto:${EMAIL_PATTERN.source}`);

function findMailto (val) {
  const match = val.match(MAILTO_PATTERN);

  if (match && match[1]) {
    return match[1];
  }

  return null;
}

export function findEmail (val) {
  const match = val.match(EMAIL_PATTERN);

  if (match && match[1]) {
    return match[1];
  }

  return null;
}

function push (array, val) {
  if (val) {
    array.push(val);
  }
}
