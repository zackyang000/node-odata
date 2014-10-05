module.exports = (grunt) ->
  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks)

  grunt.initConfig
    coffee:
      options:
        bare: true
      dist:
        files: [
          expand: true
          cwd: 'lib/'
          src: ['**/*.coffee']
          dest: 'assets/'
          ext: '.js'
        ]

    clean:
      all:
        src: "assets/**/*"


  grunt.registerTask "default", [
    "clean:all"
    "coffee"
  ]
