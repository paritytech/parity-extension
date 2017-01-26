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

import { uniq } from 'lodash';

import { UI, EV_BAR_CODE, getRetryTimeout } from '../shared';

class VersionMismatch extends Error {
  isVersionMismatch = true;
}

let codeCache = null;
export default function loadScripts (port) {
  function checkResponseOk (response) {
    if (response.ok) {
      return response;
    }
    throw new VersionMismatch('Expected successful response. Likely a version mismatch.');
  }

  function retry (msg) {
    if (msg.type !== EV_BAR_CODE) {
      return;
    }

    if (!codeCache) {
      const vendor = fetch(`http://${UI}/vendor.js`)
        .then(checkResponseOk)
        .then(response => response.blob());
      const embed = fetch(`http://${UI}/embed.html`)
        .then(checkResponseOk)
        .then(response => response.text())
        .then(page => ({
          styles: /styles\/embed\.([a-z0-9]{10})\.css/.exec(page),
          scripts: /embed\.([a-z0-9]{10})\.js/.exec(page)
        }))
        .then(res => {
          return Promise.all([
            fetch(`http://${UI}/${res.styles[0]}`).then(checkResponseOk),
            fetch(`http://${UI}/${res.scripts[0]}`).then(checkResponseOk)
          ]);
        })
        .then(([ style, script ]) => {
          return Promise
            .all([ style.blob(), script.text() ])
            .then(([ styleBlob, scriptText ]) => {
              // const regex = /"(fonts\/[^"]+)"/g;
              // const fonts = [];

              // let match = regex.exec(scriptText);

              // while (match) {
              //   fonts.push(match[1]);
              //   match = regex.exec(scriptText);
              // }

              // uniq(fonts).forEach((fontURL) => {
              //   scriptText = scriptText.replace(new RegExp(fontURL, 'g'), `http://${UI}/${fontURL}`);
              // });

              return [ styleBlob, scriptText ];
            });
        });

      codeCache = Promise.all([vendor, embed])
        .then(scripts => {
          const vendor = scripts[0];
          const styles = scripts[1][0];
          const embed = scripts[1][1];

          // Concat blobs
          const blob = new Blob([vendor, embed], { type: 'application/javascript' });
          return {
            success: true,
            styles: URL.createObjectURL(styles),
            scripts: URL.createObjectURL(blob)
          };
        });
    }

    codeCache
      .then(code => {
        retry.retries = 0;
        port.postMessage(code);
      })
      .catch(err => {
        // TODO [ToDr] For some reason we cannot check instanceof here.
        if (err.isVersionMismatch) {
          port.postMessage({
            success: false,
            error: err.message,
            ui: `http://${UI}`
          });
        }

        codeCache = null;
        retry.retries += 1;

        console.error('Could not load ParityBar scripts. Retrying in a while..', err);
        setTimeout(() => retry(msg), getRetryTimeout(retry.retries));
      });
  }

  retry.retries = 0;
  return retry;
}
