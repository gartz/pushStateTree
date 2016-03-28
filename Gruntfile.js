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
        test: 'test/**/*.js'
      },
      build: 'build',
      coverage: '<%= meta.build %>/coverage',

      //TODO: Move dist to build
      dist: '<%= meta.pkg.name %>.min.js',

      banner: '//! <%= meta.pkg.title || meta.name %> - v<%= meta.pkg.version %> - ' +
      '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
      '//<%= meta.pkg.homepage ? "* " + meta.pkg.homepage + "\\n" : "" %>' +
      '//* Copyright (c) <%= grunt.template.today("yyyy") %> <%= meta.pkg.author.name %>;' +
      ' Licensed <%= meta.pkg.license %>\n\n' +
      'var PushStateTree = {options: {VERSION: \'<%= meta.pkg.version %>\'}};\n'
    },
    clean: {
      test: [
        '<%= meta.coverage %>'
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
    coveralls: {
      options: {
        // don't fail if coveralls fails
        force: true
      },
      mainTarget: {
        src: '<%= meta.coverage %>/lcov.info'
      }
    },
    'update_json': {
      bower: {
        src: 'package.json',
        dest: 'bower.json',
        fields: [
          'name',
          'version',
          'description',
          'repository'
        ]
      },
      component: {
        src: 'package.json',
        dest: 'component.json',
        fields: {
          'name': null,
          'repository': 'repo',
          'description': null,
          'version': null,
          'keywords': null,
          'main': null,
          'dependencies': null,
          'development': 'devDependencies',
          'license': null
        }
      }
    },
    watchTask: {
      files: [
        '<%= meta.src.main %>',
        '<%= meta.src.test %>',
        'Gruntfile.js'
      ],
      tasks: [
        'update_json',
        'jshint',
        'karma:unit:run'
      ]
    },
    karma: {
      options: {
        configFile: 'karma.conf.js'
      },
      unit: {
        background: true,
        singleRun: false
      },
      continuous: {
        singleRun: true
      }
    }
  });

  require('load-grunt-tasks')(grunt, {
    pattern: ['grunt-*', '!grunt-template-jasmine-istanbul']
  });

  grunt.task.renameTask('watch', 'watchTask');

  grunt.registerTask('watch', 'Run a watch that test the code on every change', [
    'karma:unit:start',
    'watchTask'
  ]);

  grunt.registerTask('test', 'Run tests and code-coverage then print the summary.', [
    'clean:test',
    'karma:continuous'
  ]);

  grunt.registerTask('default', [
    'update_json',
    'clean',
    'test',
    'concat',
    'uglify'
  ]);
};
