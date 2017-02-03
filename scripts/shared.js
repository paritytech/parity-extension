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

const path = require('path');
const ChromeExtensionUtils = require('chrome-extension-utils');

module.exports = {
  getManifest: function getManifest (isProd = false) {
    const output = isProd
      ? 'release'
      : 'build';

    const manifestOptions = {
      manifest: path.resolve(__dirname, '../manifest.json'),
      output: path.resolve(__dirname, '../', output)
    };

    // TODO [ToDr] Disabling augmentation and popup in production
    if (isProd) {
      manifestOptions.preProcess = (manifest) => {
        const idx = manifest.content_scripts.map(x => x.augmentation).indexOf(true);
        if (idx !== -1) {
          manifest.content_scripts.splice(idx, 1);
        }
        delete manifest.browser_action;
        return manifest;
      };
    }

    return new ChromeExtensionUtils.Manifest(manifestOptions);
  }
};
