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
const webpack = require('webpack');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');

const postcssImport = require('postcss-import');
const postcssNested = require('postcss-nested');
const postcssVars = require('postcss-simple-vars');
const rucksack = require('rucksack-css');

const Manifest = require('chrome-extension-scripts/lib/manifest').default;
const ManifestPlugin = require('chrome-extension-scripts/lib/manifest/plugin').default;

const ENV = process.env.NODE_ENV || 'development';
const isProd = ENV === 'production';

const manifestOptions = {
  manifest: path.resolve('./manifest.json'),
  output: path.resolve('./build')
};

const manifest = new Manifest(manifestOptions);
manifest.run();

const entries = manifest.scripts.reduce((entries, path) => {
  const name = path.split('.').slice(0, -1).join('.');

  entries[name] = path;

  return entries;
}, {});

const postcss = [
  postcssImport({
    addDependencyTo: webpack
  }),
  postcssNested({}),
  postcssVars({
    unknown: function (node, name, result) {
      node.warn(result, `Unknown variable ${name}`);
    }
  }),
  rucksack({
    autoprefixer: true
  })
];

module.exports = {
  cache: !isProd,
  devtool: isProd ? '#hidden-source-map' : '#source-map',

  entry: entries,
  output: {
    path: manifestOptions.output,
    filename: '[name].js',
    chunkFilename: '[name]-[chunkhash].js'
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        use: 'babel-loader'
      },

      {
        test: /\.css$/,
        exclude: [ /node_modules/ ],
        use: [
          'style-loader',
          'css-loader?modules&sourceMap&importLoaders=1&localIdentName=[name]_[local]_[hash:base64:5]',
          'postcss-loader'
        ]
      },

      {
        test: /\.(ico|jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)/,
        loader: 'url-loader?limit=1000000&name=[name]-[hash].[ext]'
      }
    ]
  },

  resolve: {
    modules: [
      path.join(__dirname, './'),
      path.join(__dirname, './node_modules')
    ],
    extensions: ['.json', '.js', '.jsx'],
    unsafeCache: true
  },

  plugins: [
    new webpack.LoaderOptionsPlugin({
      minimize: isProd,
      debug: !isProd,
      options: {
        context: path.join(__dirname, './'),
        postcss: postcss
      }
    }),

    // new ManifestPlugin(manifest),

    new webpack.DefinePlugin({
      'global.GENTLY': false,
      'process.env.APP_ENV': JSON.stringify(process.env.APP_ENV),
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      'process.env.IS_BROWSER': JSON.stringify(process.env.IS_BROWSER)
    }),

    new CaseSensitivePathsPlugin()
  ]
};


