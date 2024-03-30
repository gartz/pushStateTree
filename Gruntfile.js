/**
 * pushStateTree
 * https://github.com/gartz/pushStateTree/
 * Copyright (c) 2014 Gabriel Reitz Giannattasio
 * Licensed under the MIT license.
 */
/*jslint node: true */
'use strict';

module.exports = function(grunt) {

  grunt.initConfig({
    meta: {
      pkg: grunt.file.readJSON('package.json'),
      name: '<%= meta.pkg.name %>',
      src: {
        main: 'src/**/*.js',
        test: 'test/specs/*.js',
        helper: 'test/helpers/**/*.js',
        polyfill: [
          //'bower_components/WeakMap/WeakMap.js'
        ]
      },
      dist: '<%= meta.pkg.name %>.min.js',
      report: {
        base: 'report',
        coverage: '<%= meta.report.base %>/coverage',
        junit: '<%= meta.report.base %>/junit'
      },
      banner: '//! <%= meta.pkg.title || meta.name %> - v<%= meta.pkg.version %> - ' +
      '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
      '//<%= meta.pkg.homepage ? "* " + meta.pkg.homepage + "\\n" : "" %>' +
      '//* Copyright (c) <%= grunt.template.today("yyyy") %> <%= meta.pkg.author.name %>;' +
      ' Licensed <%= meta.pkg.license %>\n\n' +
      'var PushStateTree = {options: {VERSION: \'<%= meta.pkg.version %>\'}};\n'
    },
    connect: {
      report: {
        options: {
          open: {
            target: 'http://127.0.0.1:3000',
            appName: 'google-chrome',
            callback: function() {
              grunt.log.writeln('Your browser is open with the report server url.');
              grunt.log.writeln('To close this server press CTRL+C.');
            }
          },
          keepalive: true,
          base: '.',
          port: 3000,
          useAvailablePort: true
        }
      },
      test : {
        options: {
          base: '.',
          port: '?'
        }
      }
    },
    clean: {
      test: [
        '<%= meta.report.base %>'
      ],
      concat: [
        '<%= concat.dist.dest %>'
      ],
      uglify: [
        '<%= meta.dist %>.min.js'
      ]
    },
    concat: {
      options: {
        banner: '<%= meta.banner %>',
        separator: ';'
      },
      dist: {
        src: '<%= meta.src.main %>',
        dest: '<%= meta.name %>.js'
      }
    },
    uglify: {
      options: {
        banner: '<%= meta.banner %>'
      },
      dist: {
        files: {
          '<%= meta.dist %>': ['<%= concat.dist.dest %>']
        }
      }
    },
    jasmine: {
      src: '<%= meta.src.main %>',
      options: {
        specs: '<%= meta.src.test %>',
        helpers: '<%= meta.src.helper %>',
        vendor: '<%= meta.src.polyfill %>',
        junit: {
          path: '<%= meta.report.junit %>'
        }
      },
      reportUnit: {
        src: '<%= jasmine.src %>',
        options: {
          host: 'http://127.0.0.1:<%= connect.test.options.port %>/',
          outfile: '<%= meta.report.base %>/jasmine.html',
          keepRunner: true,
          junit: {
            path: '<%= jasmine.options.junit.path %>'
          }
        }
      }
    },
    coveralls: {
      options: {
        // dont fail if coveralls fails
        force: true
      },
      mainTarget: {
        src: '<%= meta.report.coverage %>/lcov/lcov.info'
      }
    },
    jshint: {
      files: [
        '<%= meta.src.main %>',
      ],
      options: {
        // if you are using CI, this options would be good to be enabled
        //reporter: require('jshint-junit-reporter'),
        //reporterOutput: '<%= meta.report.base %>/jshint.junit.xml',
        esversion: 8,
        camelcase: true,
        curly: false,
        eqeqeq: true,
        es3: false,
        forin: true,
        freeze: false,
        immed: false,
        indent: 2,
        latedef: false,
        newcap: true,
        noarg: true,
        noempty: true,
        nonbsp: true,
        nonew: false,
        plusplus: false,
        quotmark: true,
        undef: true,
        unused: true,
        strict: true,
        trailing: true,
        maxparams: 5, // if you need more then 3 use an object param
        maxdepth: 8,
        maxlen: 100,
        boss: true,
        browser: true,
        evil: false,
        globals: {
          jQuery: false,
          console: false,
          module: false,
          globalThis: true,
          global: true,
          self: true
        }
      },
      test: {
        src: [
          'Gruntfile.js',
          '<%= meta.src.test %>'
        ],
        options: {
          strict: false,
          maxparams: 4,
          maxdepth: 6,
          globals: {
            jQuery: true,
            module: true,
            require: true,
            describe: true,
            it: true,
            expect: true,
            beforeEach: true,
            spyOn: true,
            jasmine: true
          }
        }
      }
    },
    rename: {
      jasmine: {
        files: [
          {src: ['_SpecRunner.html'], dest: '<%= meta.report.base %>/jasmine.html'},
        ]
      }
    },
    'merge-json': {
      jshint: {
        src: ['src/.jshintrc', '.jshintrc'],
        dest: '.jshintrc'
      }
    },
    watch: {
      files: [
        '<%= meta.src.main %>',
        '<%= meta.src.test %>',
        '<%= meta.src.helper %>',
        'Gruntfile.js'
      ],
      tasks: [
        'merge-json',
        'jshint',
        'connect:test',
      ]
    }
  });

  require('load-grunt-tasks')(grunt, {
    pattern: ['grunt-*', '!grunt-template-jasmine-istanbul']
  });

  grunt.registerTask('test', [
    'Run tests and code-coverage then print the summary.'
  ].join(), [
    'jshint',
    'clean:test',
    'connect:test',
  ]);

  grunt.registerTask('report', [
    'Open a web-server with coverage report. ',
    'Will open google-chrome if available.'
  ].join(), [
    'clean:test',
    'connect:test',
    'connect:report'
  ]);

  grunt.registerTask('default', [
    'merge-json',
    'clean',
    'test',
    'concat',
    'uglify'
  ]);

};
