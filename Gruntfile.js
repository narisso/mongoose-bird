module.exports = function (grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      options: {
        devel: true,
        node: true,
        reporter: 'verbose'
      },
      all: ['libs/**/*.js']
    },
    nodeunit: {
      all: ['tests/**/*_test.js']
    }
  });
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');
  grunt.loadNpmTasks('grunt-debug-task');
  grunt.registerTask('default', ['jshint']);
};
