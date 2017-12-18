# parity-extension
Parity Chrome Extension

# Development

To start developing the extension do:

```
$ yarn install
$ yarn start
```

Then head off to `chrome://extensions`, click "Load unpacked extension" and point to `build` directory.

Whenever you change anything the extension will be re-compiled, although you may need to `Reload`
the extension to see the changes.


# Releasing

To prepare a release version of the extension run:

```bash
$ yarn release
```

This will create `release` directory with a `zip` file required for upload.
