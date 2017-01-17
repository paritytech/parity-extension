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
      expect(all.github).to.be.ok;
    });

    it('extracts the correct handle', () => {
      expect(Socials.extract(rightInput).name).to.equal('foobar');
    });

    it('contains extras', () => {
      expect(Socials.extract(rightInput)).to.deep.equal({ name: 'foobar', github: true });
    });

    it('fails correctly', () => {
      expect(Socials.extract(wrongInput)).to.be.null;
    });

    it('does not extract default links', () => {
      const links = [
        'https://github.com/categories',
        'https://github.com/blog',
        'https://github.com/about',
        'https://github.com/site',
        'https://github.com/security'
      ];

      links.forEach((link) => {
        expect(Socials.extract(link)).to.be.null;
      });
    });
  });

  describe('facebook', () => {
    const rightInput = 'https://facebook.com/foobar?id=123';
    const wrongInput = 'https://facebooksad.com/foobar';

    it('exists', () => {
      expect(all.facebook).to.be.ok;
    });

    it('extracts the correct handle', () => {
      expect(Socials.extract(rightInput)).to.deep.equal({ name: 'foobar' });
    });

    it('fails correctly', () => {
      expect(Socials.extract(wrongInput)).to.be.null;
    });
  });

  describe('twitter', () => {
    const rightInput = 'https://twitter.com/foobar';
    const wrongInput = 'https://twitterasfdasd.com/foobar';

    it('exists', () => {
      expect(all.twitter).to.be.ok;
    });

    it('extracts the correct handle', () => {
      expect(Socials.extract(rightInput)).to.deep.equal({ name: 'foobar' });
    });

    it('fails correctly', () => {
      expect(Socials.extract(wrongInput)).to.be.null;
    });
  });

  describe('reddit', () => {
    const rightInput = 'https://reddit.com/u/foobar';
    const wrongInput = 'https://asdasdasd.com/foobar';

    it('exists', () => {
      expect(all.reddit).to.be.ok;
    });

    it('extracts the correct handle', () => {
      expect(Socials.extract(rightInput)).to.deep.equal({ name: 'foobar' });
    });

    it('fails correctly', () => {
      expect(Socials.extract(wrongInput)).to.be.null;
    });
  });
});
