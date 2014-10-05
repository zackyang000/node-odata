module.exports = (grunt) ->
  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks)
  debug = grunt.option("release") isnt true

  grunt.initConfig
    assets: grunt.file.readJSON('server/config/assets.json')

    coffee:
      options:
        bare: true
      dist:
        files: [
          expand: true
          cwd: 'client/'
          src: ['**/*.coffee']
          dest: 'assets/'
          ext: '.js'
        ]

    clean:
      all:
        src: "assets/**/*"

    copy:
      client:
        files: [
          expand: true
          cwd: '/'
          src: [
            '**/*'
            '!**/*.coffee'
            '!**/*.less'
          ]
          dest: 'assets'
        ]

    concurrent:
      tasks: ['nodemon', 'watch']
      options:
        logConcurrentOutput: true


  grunt.registerTask "build", ->
      grunt.task.run [
        "clean:all"
        "copy"
        "coffee"
      ]

  grunt.registerTask "default", [
    'build'
    'concurrent'
  ]
