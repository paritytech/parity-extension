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

export function positionToStyle (options = {}) {
  const { scale = 1, position = { x: 'center', y: 'center' } } = options;
  const { x, y } = position;

  // default to center
  let X = '-50%';
  let Y = `-50%`;

  if (x === 'left') {
    X = `-100%`;
  }

  if (x === 'right') {
    X = `0`;
  }

  if (y === 'top') {
    Y = `-100%`;
  }

  if (y === 'bottom') {
    Y = `0`;
  }

  return { transform: `scale(${scale}) translateX(${X}) translateY(${Y})` };
}
