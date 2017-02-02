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

/* global chrome */

import { omitBy } from 'lodash';

import Extractions from '../content/extractions';
import Lookup from './lookup';

export const FETCH_ADDRESS = 'FETCH_ADDRESS';
export const PROCESS_EXTRACTIONS = 'PROCESS_EXTRACTIONS';
export const FETCH_IMAGE = 'FETCH_IMAGE';

const IMAGES_STORAGE_KEY = 'parity::images_cache';
const IMAGES_TTL = 1000 * 3600 * 24;

const SVG_MATCH = /.svg(\?.+)?$/i;
const UNKNOWN_TOKEN_URL = 'https://raw.githubusercontent.com/ethcore/parity/1e6a2cb3783e0d66cfa730f4cea109f60dc3a685/js/assets/images/contracts/unknown-64x64.png';

export default class Processor {

  _images = {};

  constructor () {
    this.loadImages();
  }

  process (input = {}) {
    const { data, type } = input;

    switch (type) {
      case PROCESS_EXTRACTIONS:
        const extractions = Extractions.fromObject(data);

        return this.processExtractions(extractions)
          .then(() => extractions.toObject());

      case FETCH_ADDRESS:
        return this.fetchAddress(data);

      case FETCH_IMAGE:
        return this.fetchImage(data);

      default:
        return Promise.reject(`no actions matching  ${type}`);
    }
  }

  fetchAddress (address) {
    const lookup = Lookup.get();

    return lookup.address(address);
  }

  cleanImages (data) {
    const omit = (data) => {
      return data instanceof Promise || (Date.now() - data.date) > IMAGES_TTL;
    };

    return omitBy(data, omit);
  }

  loadImages () {
    chrome.storage.local.get(IMAGES_STORAGE_KEY, (storage = {}) => {
      const images = storage[IMAGES_STORAGE_KEY] || {};

      // Load the saved images, omitting the old data
      this._images = this.cleanImages(images);
      this.saveImages();
    });
  }

  saveImages () {
    const data = this.cleanImages(this._images);

    chrome.storage.local.set({ [ IMAGES_STORAGE_KEY ]: data }, () => {});
  }

  fetchImage (url) {
    const validUrl = url && url !== 'null' && url !== 'undefined'
      ? url
      : UNKNOWN_TOKEN_URL;

    if (!this._images[validUrl]) {
      console.log('fetching image', validUrl);

      this._images[validUrl] = fetch(validUrl)
        .then((response) => {
          if (SVG_MATCH.test(validUrl)) {
            return response.text().then((data) => {
              return new window.Blob([ data ], {
                type: 'image/svg+xml;charset=utf-8'
              });
            });
          }

          return response.blob();
        })
        .then((data) => {
          return blobToBase64(data);
        })
        .then((data) => {
          const date = Date.now();

          this._images[validUrl] = { data, date };
          this.saveImages();

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
        return cached && cached.data || null;
      });
  }

  processExtractions (extractions) {
    console.log('received extractions', extractions.toObject());

    const lookup = Lookup.get();
    const promises = extractions.map((extraction) => {
      return extraction.lookup(lookup);
    });

    return Promise.all(promises);
  }

  getHandler (port) {
    return (message = {}) => {
      const { id, data } = message;

      this
        .process(data)
        .then((result) => {
          port.postMessage({
            id, result
          });
        })
        .catch((error) => {
          port.postMessage({
            id, error: error
          });

          throw error;
        });
    };
  }
}

function blobToBase64 (blob) {
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
