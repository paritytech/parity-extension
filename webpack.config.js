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
const ProgressBarPlugin = require('progress-bar-webpack-plugin');

const postcssImport = require('postcss-import');
const postcssNested = require('postcss-nested');
const postcssAutoreset = require('postcss-autoreset');
const postcssVariables = require('postcss-css-variables');
const rucksack = require('rucksack-css');

const Shared = require('./scripts/shared');

const ENV = process.env.NODE_ENV || 'development';
const isProd = ENV === 'production';

// Contruct the output directory and process
// the Manifest file and write it
const manifest = Shared.getManifest(isProd);
manifest.run();

const contentDir = path.resolve(__dirname, './content');
const postcss = [
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
];

module.exports = {
  cache: !isProd,
  devtool: isProd ? '#hidden-source-map' : '#source-map',

  entry: Object.assign({},
    manifest.entries,
    { 'options/index': './options/index.js' }
  ),
  output: {
    path: manifest.buildPath,
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
        test: /\.html$/,
        use: [
          'file-loader?name=[path][name].[ext]',
          'extract-loader?publicPath=./',
          'html-loader'
        ]
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
        test: /\.css$/,
        include: [ /node_modules/ ],
        use: [
          'style-loader',
          'css-loader'
        ]
      },

      {
        test: /\.(ico|jpg|jpeg|png|gif|webp|svg|mp4|webm|wav|mp3|m4a|aac|oga)/,
        loader: 'url-loader?name=[name]-[hash].[ext]'
      },

      {
        test: /\.(woff(2)|ttf|eot|otf)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        use: [ 'file-loader?name=/web3/fonts/[name][hash:10].[ext]' ]
      }
    ]
  },

  resolve: {
    alias: {
      'whatwg-fetch': 'null.js',
      'node-fetch': 'null.js',
      'vertx': 'null.js'
    },
    modules: [
      path.join(__dirname, './'),
      path.join(__dirname, './node_modules')
    ],
    extensions: ['.json', '.js', '.jsx'],
    unsafeCache: true
  },

  plugins: [
    new ProgressBarPlugin({
      format: '[:msg] [:bar] ' + ':percent' + ' (:elapsed seconds)'
    }),

    new webpack.LoaderOptionsPlugin({
      minimize: isProd,
      debug: !isProd,
      options: {
        context: path.join(__dirname, './'),
        postcss: postcss
      }
    }),

    new webpack.DefinePlugin({
      'global.GENTLY': false,
      'process.env.APP_ENV': JSON.stringify(process.env.APP_ENV),
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      'process.env.IS_BROWSER': JSON.stringify(process.env.IS_BROWSER)
    }),

    new CaseSensitivePathsPlugin()
  ]
};
