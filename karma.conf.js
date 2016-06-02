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
  'fast-build': {
    type: 'boolean',
    describe: 'Use faster source-map techniques, more info at https://webpack.github.io/docs/configuration.html#devtool'
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

const WATCH = argv.watch;

// Fast-build option make the DEVTOOL use a faster source-map technique, however it is harder to breakpoint in runtime
// so it's disabled by default, more info at https://webpack.github.io/docs/configuration.html#devtool
const devtool = argv['fast-build'] ? 'cheap-module-eval-source-map' : 'inline-source-map';


// For development server testing, it should not be a library, a devserver.js is including and assign the global
// PushStateTree for the logic in the Demo work
delete webpackConfig.output.library;
delete webpackConfig.output.libraryTarget;
delete webpackConfig.output.umdNamedDefine;

if (WATCH) {
  let port = argv['dev-port'] || 8080;

  const webpackDevConfig = Object.assign({
    resolve: {}
  }, webpackConfig, {
    debug: true,
    devtool
  });

  webpackDevConfig.output.pathinfo = true;
  webpackDevConfig.resolve.alias = {
    'push-state-tree': path.resolve(__dirname, webpackDevConfig.entry['push-state-tree'][0])
  };

  webpackDevConfig.entry['push-state-tree'] = [
    // Add inline webpack-dev-server client
    `webpack-dev-server/client?http://localhost:${port}/`,
    // Keep default lib
    'expose?PushStateTree!' + webpackDevConfig.entry['push-state-tree'][0]
  ];

  webpackDevConfig.module.preLoaders = [];

  var compiler = webpack(webpackDevConfig);
  var server = new webpackDevServer(compiler, {
    historyApiFallback: true,
    quiet: true,
    noInfo: true,
    inline: true,
    stats: { colors: true },
    publicPath: '/build/'
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
  var configuration = {

    // base path, that will be used to resolve files and exclude
    basePath: '.',

    // frameworks to use
    frameworks: ['mocha', 'chai-spies', 'chai'],

    // list of files / patterns to load in the browser
    files: [
      'test/**/*.js'
    ],

    // list of files to exclude
    exclude: [
      'test/helper/**/*.js'
    ],

    // test results reporter to use
    reporters: ['progress', 'coverage'],

    preprocessors: {
      // source files, that you wanna generate coverage for
      // do not include tests or libraries
      // (these files will be instrumented by Istanbul)
      'src/**/*.js': ['coverage', 'webpack', 'sourcemap'],
      'test/**/*.js': ['webpack', 'sourcemap']
    },

    webpack: {
      // Create a literal object for the module to not change how webpack-dev-server load the modules
      module: Object.assign({}, webpackConfig.module, (function(){
        let module = {
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
              cacheDirectory: true,
              query: {
                presets: ['es2015'],
                plugins: [
                  'transform-runtime',
                  [
                    'transform-strict-mode',
                    {
                      strict: true
                    }
                  ]
                ]
              }
            },
            {
              test: /\.json$/,
              exclude: /(node_modules)/,
              loader: 'json'
            }
          ],
          // postLoaders: [
          //   {
          //     test: /\.js$/,
          //     exclude: /(test|node_modules|bower_components|\.shim\.js$|\.json$)/,
          //     loader: 'istanbul-instrumenter'
          //   }
          // ]
        };

        return module;
      }())),
      plugins: webpackConfig.plugins,
      bail: !WATCH,
      devtool
    },

    webpackMiddleware: {
      noInfo: true,
      stats: {
        colors: true,
        chunks: false,
        modules: false,
        reasons: false
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
    browsers: (
      WATCH
      ? ['PhantomJS', 'Chrome', 'Firefox']
      : ['PhantomJS']
    ),
    customLaunchers: {
      chrome_travis_ci: {
        base: 'Chrome',
        flags:['--no-sandbox']
      },
      firefox_travis_ci: {
        base: 'Firefox'
      }
    },

    // If browser does not capture in given timeout [ms], kill it
    captureTimeout: 60000,

    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: !argv.watch
  };
  if (process.env.TRAVIS) {
    configuration.browsers = ['chrome_travis_ci', 'firefox_travis_ci'];
  }
  config.set(configuration);
};
