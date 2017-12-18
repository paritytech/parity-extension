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

import { flatten } from 'lodash';

import Config, { DEFAULT_CONFIG } from './config';
import State from './state';
import { EV_BAR_CODE, getRetryTimeout, isEmbedDev } from '../shared';

class VersionMismatch extends Error {
  isVersionMismatch = true;
}

let codeCache = null;
let codeCacheVersion = null;

export default class ScriptsLoader {
  retries = 0;
  UI = DEFAULT_CONFIG.UI;

  store = null;

  constructor (store) {
    this.store = store;

    Config.get()
      .then((config) => {
        this.UI = config.UI;
      });
  }

  attachListener (port) {
    return (msg) => {
      return this.retry(port, msg);
    };
  }

  retry (port, msg) {
    if (msg.type !== EV_BAR_CODE) {
      return;
    }

    // Clear cache if parity was updated.
    if (codeCacheVersion !== State.version) {
      codeCache = null;
    }

    if (!codeCache) {
      codeCacheVersion = State.version;
      codeCache = this.fetchFromJSON().catch(() => {
        return this.fetchFromHTML();
      });
    }

    return codeCache
      .then(code => {
        this.retries = 0;
        port.postMessage(code);
      })
      .catch(err => {
        // TODO [ToDr] For some reason we cannot check instanceof here.
        if (err.isVersionMismatch) {
          port.postMessage({
            success: false,
            error: err.message,
            ui: this.UI
          });
          return;
        }

        if (this.retries === 5) {
          this.retries = 0;
          port.postMessage({
            success: false,
            error: err.message,
            ui: this.UI
          });
          return;
        }

        codeCache = null;
        this.retries += 1;

        console.error('Could not load ParityBar scripts. Retrying in a while..', err);
        setTimeout(() => this.retry(port, msg), getRetryTimeout(this.retries));
      });
  }

  checkResponseOk (response) {
    if (response.ok) {
      return response;
    }

    throw new VersionMismatch('Expected successful response. Likely a version mismatch.');
  }

  fetchFromJSON () {
    return fetch(`${this.UI}/embed.json`)
      .then((response) => this.checkResponseOk(response))
      .then((response) => response.json())
      .then((embed) => {
        const { assets } = embed;

        const filteredAssets = assets
          .filter((asset) => !/html$/.test(asset))
          .filter((asset) => !/^embed(.+)js$/.test(asset));

        const mainScript = assets.find((asset) => /^embed(.+)js$/.test(asset));
        const assetsPromises = filteredAssets
          .map((asset) => {
            return fetch(`${this.UI}/${asset}`)
              .then((response) => response.blob())
              .then((blob) => {
                if (/\.js$/.test(asset)) {
                  return URL.createObjectURL(blob, { type: 'application/javascript' });
                }

                if (/\.css$/.test(asset)) {
                  return URL.createObjectURL(blob, { type: 'text/css' });
                }

                return URL.createObjectURL(blob);
              })
              .then((url) => ({ path: asset, url }));
          });

        const ui = isEmbedDev ? 'http://127.0.0.1:3000' : this.UI;
        const scriptPromise = fetch(`${ui}/${mainScript}`)
          .then((response) => response.text());

        return Promise.all([ scriptPromise, Promise.all(assetsPromises) ]);
      })
      .then(([ script, assets ]) => {
        const styles = assets.find((asset) => /^embed(.+)css$/.test(asset.path));

        assets.forEach((asset) => {
          const { path, url } = asset;
          const regex = new RegExp(path, 'g');

          script = script.replace(regex, url);
        });

        return {
          script: new Blob([ script ], { type: 'application/javascript' }),
          styles: styles ? styles.url : null
        };
      })
      .then((blob) => {
        return {
          success: true,
          styles: blob.styles,
          scripts: URL.createObjectURL(blob.script)
        };
      });
  }

  fetchFromHTML () {
    const vendor = fetch(`${this.UI}/vendor.js`)
      .then((response) => this.checkResponseOk(response))
      .then(response => response.blob())
      .then((blob) => [ { blob, type: 'script' } ]);

    const embed = fetch(`${this.UI}/embed.html`)
      .then((response) => this.checkResponseOk(response))
      .then((response) => response.text())
      .then((page) => ({
        styles: /styles\/embed\.([a-z0-9]{10})\.css/.exec(page),
        scripts: /embed\.([a-z0-9]{10})\.js/.exec(page)
      }))
      .then((res) => {
        const promises = [];

        if (res.styles) {
          const promise = fetch(`${this.UI}/${res.styles[0]}`)
            .then((response) => this.checkResponseOk(response))
            .then((response) => response.blob())
            .then((blob) => ({ blob, type: 'style' }));

          promises.push(promise);
        }

        if (res.scripts) {
          const promise = fetch(`${this.UI}/${res.scripts[0]}`)
            .then((response) => this.checkResponseOk(response))
            .then((response) => response.blob())
            .then((blob) => ({ blob, type: 'script' }));

          promises.push(promise);
        }

        return Promise.all(promises);
      });

    return Promise.all([vendor, embed])
      .then((responses) => {
        const blobs = flatten(responses);

        const scriptBlobs = blobs.filter((b) => b.type === 'script').map((b) => b.blob);
        const styleBlobs = blobs.filter((b) => b.type === 'style').map((b) => b.blob);

        // Concat blobs
        const scriptBlob = new Blob(scriptBlobs, { type: 'application/javascript' });
        const styleBlob = new Blob(styleBlobs, { type: 'text/css' });

        return {
          success: true,
          styles: URL.createObjectURL(styleBlob),
          scripts: URL.createObjectURL(scriptBlob)
        };
      });
  }
}
