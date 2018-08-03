# parity-extension

# Parity Chrome Extension is not actively maintained anymore.
Please use Metamask in combination with a local Parity Ethereum node to be able to browse Web3-enabled websites in a fully decentralised manner. [Here is a short guide for more information](https://wiki.parity.io/FAQ#how-to-use-parity-ethereum-chrome-extension-to-browse-a-web3-website).




## Development

To start developing the extension do:

```
$ yarn install
$ yarn start
```

Then head off to `chrome://extensions`, click "Load unpacked extension" and point to `build` directory.

Whenever you change anything the extension will be re-compiled, although you may need to `Reload`
the extension to see the changes.

## Run with Parity Dev UI

First run Parity development UI in `EMBED` mode to start producing `embed.js` script.

```
$ cd parity/js
$ EMBED=1 npm start
```

Then run extension and pass `EMBED` flag as well (this will fetch `embed.js` from `127.0.0.1:3000` but still connect to `127.0.0.1:8180` for communication).

```
$ cd parity-extension
$ EMBED=1 yarn start
```

Later proceed with the extension as usual - "Load unpacked extension" from `build` directory.


## Releasing

To prepare a release version of the extension run:

```bash
$ yarn release
```

This will create `release` directory with a `zip` file required for upload.
