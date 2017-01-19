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

import Socials from './socials';

describe('content/socials', () => {
  const { all } = Socials;

  describe('github', () => {
    const rightInput = 'https://github.com/foobar';
    const wrongInput = 'https://githubwe.com/foobar';

    it('exists', () => {
      expect(all.github).toBeDefined();
    });

    it('extracts the correct handle', () => {
      expect(Socials.extract(rightInput).name).toEqual('foobar');
    });

    it('contains extras', () => {
      expect(Socials.extract(rightInput)).toEqual({ name: 'foobar', github: true });
    });

    it('fails correctly', () => {
      expect(Socials.extract(wrongInput)).toBeNull();
    });

    it('does not extract default links', () => {
      const links = [
        'https://github.com/categories',
        'https://github.com/blog',
        'https://github.com/about',
        'https://github.com/site',
        'https://github.com/security',
        'https://github.com/ '
      ];

      links.forEach((link) => {
        expect(Socials.extract(link)).toBeNull();
      });
    });

    it('does not extract deep links', () => {
      const links = [
        'https://github.com/foobar?tab=followers',
        'https://github.com/foobar/followers',
        'https://github.com/foobar/repo/reps'
      ];

      links.forEach((link) => {
        expect(Socials.extract(link)).toBeNull();
      });
    });
  });

  describe('facebook', () => {
    const rightInput = 'https://facebook.com/foobar';
    const wrongInput = 'https://facebooksad.com/foobar';

    it('exists', () => {
      expect(all.facebook).toBeDefined;
    });

    it('extracts the correct handle', () => {
      expect(Socials.extract(rightInput)).toEqual({ name: 'foobar' });
    });

    it('fails correctly', () => {
      expect(Socials.extract(wrongInput)).toBeNull();
    });
  });

  describe('twitter', () => {
    const rightInput = 'https://twitter.com/foobar';
    const wrongInput = 'https://twitterasfdasd.com/foobar';

    it('exists', () => {
      expect(all.twitter).toBeDefined;
    });

    it('extracts the correct handle', () => {
      expect(Socials.extract(rightInput)).toEqual({ name: 'foobar' });
    });

    it('fails correctly', () => {
      expect(Socials.extract(wrongInput)).toBeNull();
    });
  });

  describe('reddit', () => {
    const rightInput = 'https://reddit.com/u/foobar';
    const wrongInput = 'https://asdasdasd.com/foobar';

    it('exists', () => {
      expect(all.reddit).toBeDefined;
    });

    it('extracts the correct handle', () => {
      expect(Socials.extract(rightInput)).toEqual({ name: 'foobar' });
    });

    it('fails correctly', () => {
      expect(Socials.extract(wrongInput)).toBeNull();
    });
  });
});
