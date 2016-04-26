/*eslint no-console: 0*/
'use strict';
const path = require('path');
const webpack = require('webpack');
const moment = require('moment');
const pkg = require('./package.json');

const yargs = require('yargs');

yargs.options({
  'publish': {
    type: 'boolean',
    describe: 'Create multiple entry points'
  }
});

let argv = yargs.argv;

const PUBLISH = argv.publish;
const BASE_PATH = path.resolve(__dirname);

const BANNER = `${pkg.title} - v${pkg.version} - ${moment().format('YYYY-MM-DD')}
 ${pkg.homepage}
 Copyright (c) ${moment().format('YYYY')} ${pkg.author.name}; Licensed ${pkg.licenses[0].type}`;

let config = {
  entry: PUBLISH ? {
    'push-state-tree': ['./src/main'],
    'push-state-tree.min': ['./src/main']
  } : {
    'push-state-tree': ['./src/main']
  },
  output: {
    path: path.join(BASE_PATH, 'build'),
    filename: '[name].js',
    library: 'PushStateTree',
    libraryTarget: 'umd',
    umdNamedDefine: false,
    devtoolModuleFilenameTemplate: 'webpack://pushstatetree.source/[resource-path]'
  },

  // Records are needed for HMR and it's used by the PHP to change layout file address
  recordsPath: path.join(BASE_PATH, 'build/records.json'),
  resolve: {
    root: path.join(BASE_PATH, 'src')
  },
  module: {
    preLoaders: [
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        loader: 'eslint'
      }
    ],
    loaders: [
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        loader: 'babel',
        cacheDirectory: true
        // Babel configurations are located in the package.json file
      }
    ]
  },
  plugins: [
    // Allow global definition to setup environment conditional where minification can remove pieces of code
    new webpack.DefinePlugin({
      //PST_NO_OLD_IE: false, // Do not release with this option set
      VERSION: JSON.stringify(pkg.version || ''),
      DEV_ENV: !PUBLISH
    }),

    new webpack.BannerPlugin(BANNER, {entryOnly: true})
  ],
  devtool: 'hidden-source-map'
};

if (PUBLISH) {
  config.plugins.push(new webpack.optimize.UglifyJsPlugin({
    test: /\.min\.js$/,
    sourceMap: true
  }));
}

module.exports = config;
