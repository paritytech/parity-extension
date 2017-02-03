const fs = require('fs');
const ChromeExtension = require('crx');
const path = require('path');

const base = path.join(__dirname, '..', 'release');
const name = require(path.join(base, 'source', 'manifest.json')).name;
const argv = require('minimist')(process.argv.slice(2));

const keyPath = argv.key || 'key.pem';
const existsKey = fs.existsSync(keyPath);
const crx = new ChromeExtension({
  appId: argv['app-id'],
  codebase: argv.codebase,
  privateKey: existsKey ? fs.readFileSync(keyPath) : null
});

crx.load(path.join(base, 'source'))
  .then(() => crx.loadContents())
  .then(archiveBuffer => {
    fs.writeFile(path.join(base, `${name}.zip`), archiveBuffer);

    if (!argv.codebase || !existsKey) {
      return;
    }

    return crx.pack(archiveBuffer).then(crxBuffer => {
      const updateXML = crx.generateUpdateXML();

      fs.writeFile(path.join(base, 'update.xml'), updateXML);
      fs.writeFile(path.join(base, `${name}.crx`), crxBuffer);
    });
  })
  .catch(err => {
    console.error(err);
    throw err;
  });
