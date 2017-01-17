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
  describe('github', () => {
    const { github } = Socials;

    it('exports the matcher', () => {
      expect(github).to.be.ok;
      expect(github.matcher).to.be.ok;
    });

    it('extract links correctly', () => {
      const input = 'https://github.com/foobar';
      const result = github.matcher.exec(input)[1];

      expect(github.matcher.test(input)).to.be.true;
      expect(result).to.equal('foobar');
    });

    it('fails correctly', () => {
      const input = 'https://gooks.com/foobar';
      expect(github.matcher.test(input)).to.be.false;
    });
  });

  describe('facebook', () => {
    const { facebook } = Socials;

    it('exports the matcher', () => {
      expect(facebook).to.be.ok;
      expect(facebook.matcher).to.be.ok;
    });

    it('extract links correctly', () => {
      const input = 'https://facebook.com/foobar';
      const result = facebook.matcher.exec(input)[1];

      expect(facebook.matcher.test(input)).to.be.true;
      expect(result).to.equal('foobar');
    });

    it('fails correctly', () => {
      const input = 'https://gooks.com/foobar';
      expect(facebook.matcher.test(input)).to.be.false;
    });
  });

  it('extracts links correctly', () => {
    const input1 = 'http://asdasdas.com/foobar';
    const input2 = 'http://facebook.com/foobar';
    const result1 = Socials.extract(input1);
    const result2 = Socials.extract(input2);

    expect(result1).to.be.null;
    expect(result2).to.equal('foobar');
  });
});
