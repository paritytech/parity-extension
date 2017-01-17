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

  /**
   * Tries to extract a handle from the given input based on different
   * social networks regex (facebook, github, etc...)
   */
  static extract (input) {
    const { all } = Socials;

    const social = Object.values(all).find((social) => {
      const { matcher } = social;
      return matcher.test(input);
    });

    if (!social) {
      return null;
    }

    // Return the handle from the RegExp matcher
    return { name: social.matcher.exec(input)[1] };
  }

  static get all () {
    const { github, facebook, twitter, reddit } = Socials;

    return {
      github, facebook, twitter, reddit
    };
  }

  static get github () {
    const matcher = /(?:https?:\/\/)?(?:www.)?github.(?:[a-z]+)\/([^/?]+)/i;

    return {
      matcher
    };
  }

  static get facebook () {
    const matcher = /(?:https?:\/\/)?(?:www.)?facebook.(?:[a-z]+)\/([^/?]+)/i;

    return {
      matcher
    };
  }

  static get twitter () {
    const matcher = /(?:https?:\/\/)?(?:www.)?twitter.(?:[a-z]+)\/([^/?]+)/i;

    return {
      matcher
    };
  }

  static get reddit () {
    const matcher = /(?:https?:\/\/)?(?:www.)?reddit.(?:[a-z]+)\/u\/([^/?]+)/i;

    return {
      matcher
    };
  }

}
