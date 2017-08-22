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

export default class Socials {
  static extract (input) {
    const matches = [];
    let text = input;
    let match = Socials.extractSingle(text);

    while (match) {
      matches.push(match);

      // Re-extract from the text starting after the current match
      const index = text.indexOf(match.name);
      text = text.slice(index + match.name.length);
      match = Socials.extractSingle(text);
    }

    return matches;
  }

  /**
   * Tries to extract a handle from the given input based on different
   * social networks regex (facebook, github, etc...)
   */
  static extractSingle (input) {
    const { all } = Socials;

    let match = null;
    const social = Object.keys(all).map(key => all[key]).find((social) => {
      match = social.match(input);
      return match;
    });

    const blacklist = [ '/', '?', '#' ];
    const matchBlacklist = blacklist.find((s) => match && match.handle.includes(s));

    if (!match || matchBlacklist) {
      return null;
    }

    // Return the handle from the RegExp matcher
    const extras = social.extras || {};
    return { name: match.handle, text: match.text, ...extras };
  }

  static get all () {
    const { github, facebook, twitter, reddit } = Socials;

    return {
      github, facebook, twitter, reddit
    };
  }

  static get github () {
    const blacklist = [
      'about', 'blog', 'site', 'security', 'categories',
      'pulls', 'issues', 'notifications', 'new', 'organizations',
      'explore', 'integrations', 'settings', 'features', 'contact',
      'orgs', 'dashboard', 'watching', 'account'
    ];

    const blacklistRegexp = blacklist.join('|');
    const matcher = new RegExp(`(?:https?://)?(?:www.)?github.(?:[a-z]+)/(?!(${blacklistRegexp}))([^\\s]+)`, 'i');

    return {
      match: (input) => {
        if (!matcher.test(input)) {
          return null;
        }

        const matches = matcher.exec(input);
        return { handle: matches[2], text: matches[0] };
      },
      extras: { github: true }
    };
  }

  static get facebook () {
    const matcher = /(?:https?:\/\/)?(?:www.)?facebook.(?:[a-z]+)\/([^\s]+)/i;

    return {
      match: (input) => {
        if (!matcher.test(input)) {
          return null;
        }

        const matches = matcher.exec(input);
        return { handle: matches[1], text: matches[0] };
      }
    };
  }

  static get twitter () {
    const matcher = /(?:https?:\/\/)?(?:www.)?twitter.(?:[a-z]+)\/([^\s]+)/i;

    return {
      match: (input) => {
        if (!matcher.test(input)) {
          return null;
        }

        const matches = matcher.exec(input);
        return { handle: matches[1], text: matches[0] };
      }
    };
  }

  static get reddit () {
    const matcher = /(?:https?:\/\/)?(?:www.)?reddit.(?:[a-z]+)\/u\/([^\s]+)/i;

    return {
      match: (input) => {
        if (!matcher.test(input)) {
          return null;
        }

        const matches = matcher.exec(input);
        return { handle: matches[1], text: matches[0] };
      }
    };
  }
}
