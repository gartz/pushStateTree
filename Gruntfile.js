/**
 * pushStateTree
 * https://github.com/gartz/pushStateTree/
 * Copyright (c) 2014 Gabriel Reitz Giannattasio
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    site: grunt.file.readYAML('_config.yml'),

    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      all: ['Gruntfile.js', 'lib/*.js', 'test/*.js']
    },

    assemble: {
      options: {flatten: true},
      docs: {
        src: ['docs/index.hbs'],
        dest: '<%= site.destination %>/',
      }
    },

    // Before generating any new files,
    // remove any previously-created files.
    clean: {
      example: ['<%= site.destination %>/*.html']
    },

    nodeunit: {
      files: ['test/test-*.js']
    },

    watch: {
      jshint: {
        files: ['<%= jshint.all %>'],
        tasks: ['jshint:lint']
      }
    }
  });

  // Load npm plugins to provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('assemble');

  // Tests to be run.
  grunt.registerTask('test', ['nodeunit']);

  // Default to tasks to run with the "grunt" command.
  grunt.registerTask('default', ['clean', 'jshint', 'test', 'assemble']);
};
