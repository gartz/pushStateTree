'use strict';

const webpackDevServer = require('webpack-dev-server');
const webpack = require('webpack');
const webpackConfig = require('./webpack.config');
const yargs = require('yargs');
const open = require('open');
const path = require('path');

yargs.options({
  'watch': {
    type: 'boolean',
    describe: 'Start a dev-server on port 8080 and karma server on port 9876'
  },
  'dev-port': {
    type: 'numeric',
    describe: 'The dev-server port',
    default: 8080
  },
  'open': {
    type: 'boolean',
    describe: 'Open the default browser'
  }
});

let argv = yargs.argv;

if (argv.watch) {
  let port = argv['dev-port'] || 8080;

  const webpackDevConfig = Object.assign({
    cache: true,
    devtool: 'hidden-source-map'
  }, webpackConfig);

  webpackDevConfig.entry['push-state-tree'] = [
    webpackConfig.entry['push-state-tree'],
    `webpack-dev-server/client?http://localhost:${port}/`
  ];

  var compiler = webpack(webpackDevConfig);
  var server = new webpackDevServer(compiler, {
    historyApiFallback: true,
    quiet: true,
    noInfo: true,
    inline: true,
    stats: { colors: true },
    headers: { 'X-SourceMap': '/push-state-tree.js.map' }
  });
  server.listen(port, err => {
    if (err) throw err;

    var uri = `http://localhost:${port}/`;
    console.log(uri);

    console.log(`webpack result is served from ${path.resolve('.')}`);
    console.log('404s will fallback to /index.html');

    if (argv.open)
      open(uri);
  });
}

module.exports = function (config) {
  config.set({

    // base path, that will be used to resolve files and exclude
    basePath: '.',

    // frameworks to use
    frameworks: ['jasmine'],

    // list of files / patterns to load in the browser
    files: [
      'src/**/*.js',
      'test/**/*.js'
    ],

    // list of files to exclude
    exclude: [],

    // test results reporter to use
    reporters: ['progress', 'coverage'],

    preprocessors: {
      // source files, that you wanna generate coverage for
      // do not include tests or libraries
      // (these files will be instrumented by Istanbul)
      'src/**/*.js': ['coverage'],
      'test/**/*.js': ['webpack', 'sourcemap']
    },

    webpack: {
      plugins: webpackConfig.plugins,
      devtool: 'inline-source-map'
    },

    webpackMiddleware: {
      stats: {
        colors: true
      }
    },

    coverageReporter: {
      dir: 'build/coverage/',
      instrumenterOptions: {
        istanbul: { noCompact: true }
      },
      reporters: [
        // reporters not supporting the `file` property
        { type: 'html', subdir: 'report-html' },
        { type: 'lcov', subdir: 'report-lcov' },
        // reporters supporting the `file` property, use `subdir` to directly
        // output them in the `dir` directory
        { type: 'cobertura', subdir: '.', file: 'cobertura.txt' },
        { type: 'lcovonly', subdir: '.', file: 'lcov.info' },
        { type: 'teamcity', subdir: '.', file: 'teamcity.txt' },
        { type: 'text' },
        { type: 'text-summary' }
      ]
    },

    // web server port
    port: 9876,

    // enable / disable colors in the output (reporters and logs)
    colors: true,

    // level of logging
    logLevel: config.LOG_INFO,

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,

    // Start these browsers
    browsers: ['PhantomJS'],

    // If browser does not capture in given timeout [ms], kill it
    captureTimeout: 60000,

    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: !argv.watch
  });
};
