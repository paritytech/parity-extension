// Given DOM element returns array of possible id-links to resolve.
export function extractPossibleMatches ($dom) {
  const { href, title, alt } = $dom;
  const matches = [];

  if (href) {
    console.log('Checking: ', href);
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
