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

    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      all: ['Gruntfile.js', 'pushStateTree.js', 'test/*.js']
    },
    
    uglify: {
      my_target: {
        options: {
          sourceMap: true,
          sourceMapName: 'pushStateTree.map',
          compress: {
            drop_console: true
          }
        },
        files: {
          'pushStateTree.min.js': ['pushStateTree.js']
        }
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
      },
      uglify: {
        files: ['<%= jshint.all %>'],
        tasks: ['uglify']
      }
    }
  });

  // Load npm plugins to provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks("grunt-modernizr");

  // Tests to be run.
  grunt.registerTask('test', ['nodeunit']);

  // Default to tasks to run with the "grunt" command.
  grunt.registerTask('default', ['jshint', 'test', 'uglify']);
};
