const path = require('path');
const webpack = require('webpack');
const postcssImport = require('postcss-import');
const postcssNested = require('postcss-nested');
const postcssAutoreset = require('postcss-autoreset');
const postcssVariables = require('postcss-css-variables');
const rucksack = require('rucksack-css');

const contentDir = path.resolve(__dirname, './content');

module.exports = {
  plugins: [
    postcssImport({
      addDependencyTo: webpack
    }),
    postcssNested({}),
    postcssAutoreset({
      rulesMatcher: (rule, data) => {
        const { file } = rule.source.input;

        // Only use Autoreset for content folder
        // stylesheets
        if (!file.includes(contentDir)) {
          return false;
        }

        return !rule.selector.match(/(hover|open|icon|root|\*)/);
      }
    }),
    postcssVariables({}),
    rucksack({
      autoprefixer: true
    })
  ]
};
