// Copyright 2015-2017 Parity Technologies (UK) Ltd.
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

import { omitBy } from 'lodash';

const STORAGE_KEY = 'parity::images_cache';
const TTL = 1000 * 3600 * 24;

const SVG_MATCH = /.svg(\?.+)?$/i;
const UNKNOWN_TOKEN_URL = 'https://raw.githubusercontent.com/ethcore/parity/1e6a2cb3783e0d66cfa730f4cea109f60dc3a685/js/assets/images/contracts/unknown-64x64.png';

export default class Images {

  _images = {};

  store = null;

  constructor (store) {
    this.store = store;

    this.load();
  }

  clean (data) {
    const omit = (data) => {
      return data instanceof Promise || (Date.now() > data.expires);
    };

    const images = omitBy(data, omit);

    this._images = images;

    return images;
  }

  load () {
    return new Promise((resolve) => {
      chrome.storage.local.get(STORAGE_KEY, (storage = {}) => {
        const images = storage[STORAGE_KEY] || {};

        // Load the saved images, omitting the old data
        this.clean(images);
        this.save();
        resolve();
      });
    });
  }

  save () {
    setTimeout(() => {
      const data = this.clean(this._images);
      chrome.storage.local.set({ [ STORAGE_KEY ]: data }, () => {});
    }, 50);
  }

  /**
   * Fetch and cache any image from the given URL.
   * Returns a Promise that gets resolved with a
   * string, the base64 of the image / or null.
   *
   * @param  {String} url   - The URL of the Image to fetch
   * @return {Promise}      - Promise resolved with the base64 of
   *                          the image
   */
  fetchImage (url) {
    const validUrl = url && url !== 'null' && url !== 'undefined'
      ? url
      : UNKNOWN_TOKEN_URL;

    if (!this._images[validUrl]) {
      console.log('fetching image', validUrl);

      this._images[validUrl] = fetch(validUrl)
        .then((response) => {
          if (SVG_MATCH.test(validUrl)) {
            return response.text()
              .then((data) => new window.Blob([ data ], { type: 'image/svg+xml;charset=utf-8' }));
          }

          return response.blob();
        })
        .then((data) => {
          return blobToBase64(data);
        })
        .then((data) => {
          const expires = Date.now() + TTL;

          this._images[validUrl] = { data, expires };
          this.save();

          return this._images[validUrl];
        })
        .catch((error) => {
          // Remove cached promise on error
          this._images[validUrl] = null;
          throw error;
        });
    }

    return Promise.resolve(this._images[validUrl])
      .then((cached) => {
        if (cached && cached.expires < Date.now()) {
          this.load().then(() => this.fetchImage(url));
        }

        return cached && cached.data || null;
      });
  }

}

export function blobToBase64 (blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);

    reader.onloadend = () => {
      const base64data = reader.result;
      resolve(base64data);
    };

    reader.onerror = (error) => {
      reject(error);
    };
  });
}
