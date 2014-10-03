module.exports = (grunt) ->
  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks)
  debug = grunt.option("release") isnt true

  grunt.initConfig
    assets: grunt.file.readJSON('server/config/assets.json')

    #server
    nodemon:
      server:
        script: "server.js"
        options:
          args: []
          ext: "js,json,html"
          nodeArgs: ["--debug"]
          delayTime: 1
          env:
            PORT: 30001
          cwd: '_dist/server'

    #client
    connect:
      client:
        options:
          port: 30000
          hostname: 'localhost'
          base:'_dist/client'
          middleware:  (connect, options) ->
            middlewares = []

            middlewares.push(require('connect-modrewrite')([
                  '^/admin$ /admin-index.html'
                  '^/admin[/](.*)$ /admin-index.html'
                  '!\\.html|\\.js|\\.css|\\.otf|\\.eot|\\.svg|\\.ttf|\\.woff|\\.jpg|\\.bmp|\\.gif|\\.png|\\.txt$ /index.html'
            ]))

            require('connect-livereload') port:30005

            options.base.forEach (base) ->
              middlewares.push(connect.static(base))

            return middlewares

    open:
      server:
        url:'http://localhost:30000'

    watch:
      options:
        livereload: 30002
      clientFile:
        files: ['client/**/*.js','client/**/*.css','client/**/*.html']
        tasks: ['newer:copy:client','sails-linker','replace:livereload']
      clientCoffee:
        files: ['client/**/*.coffee']
        tasks: ['newer:coffee:client','sails-linker','replace:livereload']
      clientLess:
        files: ['client/**/*.less']
        tasks: ['newer:less','sails-linker','replace:livereload']
      serverFile:
        files: ['server/**/*','!server/**/*.coffee']
        tasks: ['newer:copy:server']
      serverCoffee:
        files: ['server/**/*.coffee']
        tasks: ['newer:coffee:server']

    coffee:
      options:
        bare: true
      client:
        files: [
          expand: true
          cwd: 'client/'
          src: ['**/*.coffee']
          dest: '_dist/client/'
          ext: '.js'
        ]
      server:
        files: [
          expand: true
          cwd: 'server/'
          src: ['**/*.coffee']
          dest: '_dist/server/'
          ext: '.js'
        ]

    less:
      client:
        files: [
          expand: true
          cwd: 'client/'
          src: ['**/*.less']
          dest: '_dist/client'
          ext: '.css'
        ]

    uglify:
      options:
        mangle: false
        beautify: true
      production:
        files:
          '_dist/client/index.js': ["<%= assets.commonJs %>", "<%= assets.js %>"]
          '_dist/client/admin-index.js': ["<%= assets.commonJs %>", "<%= assets.adminJs %>"]

    cssmin:
      production:
        files:
          '_dist/client/index.css': ["<%= assets.commonCss %>", "<%= assets.css %>"]
          '_dist/client/admin-index.css': ["<%= assets.commonCss %>", "<%= assets.adminCss %>"]

    'sails-linker':
      js:
        options:
          startTag: "<!--SCRIPTS-->"
          endTag: "<!--SCRIPTS END-->"
          fileTmpl:  if debug then "<script src='/%s\'><\/script>" else "<script src='/%s?v=#{+new Date()}\'><\/script>"
          appRoot: "_dist/client/"
        files:
          '_dist/client/index.html': if debug then ["<%= assets.commonJs %>", "<%= assets.js %>"] else "_dist/client/index.js"
          '_dist/client/admin-index.html': if debug then ["<%= assets.commonJs %>", "<%= assets.adminJs %>"] else "_dist/client/admin-index.js"
      css:
        options:
          startTag: "<!--STYLES-->"
          endTag: "<!--STYLES END-->"
          fileTmpl: if debug then "<link href='/%s' rel='stylesheet' />" else "<link href='/%s?v=#{+new Date()}' rel='stylesheet' />"
          appRoot: "_dist/client/"
        files:
          '_dist/client/index.html': if debug then ["<%= assets.commonCss %>", "<%= assets.css %>"] else "_dist/client/index.css"
          '_dist/client/admin-index.html': if debug then ["<%= assets.commonCss %>", "<%= assets.adminCss %>"] else "_dist/client/admin-index.css"

    clean:
      all:
        src: "_dist/**/*"

      redundant:
        src: [
          "_dist/client/*"
          "!_dist/client/data"
          "!_dist/client/img"
          "!_dist/client/plugin"
          "!_dist/client/*.*"
        ]

    copy:
      client:
        files: [
          expand: true
          cwd: 'client/'
          src: [
            '**/*'
            '!**/*.coffee'
            '!**/*.less'
          ]
          dest: '_dist/client'
        ]
      server:
        files: [
          expand: true
          cwd: 'server/'
          src: [
            '**/*'
            '!**/*.coffee'
          ]
          dest: '_dist/server'
        ]

    bower:
      dev:
        dest: '_dist/client/vendor'
        options:
          expand: true

    inline_angular_templates:
      dist:
        options:
          base: '_dist/client'
          prefix: '/'
          selector: 'body'
          method: 'append'
          unescape:
            '&lt;': '<'
            '&gt;': '>'
            '&apos;': '\''
            '&amp;': '&'
        files:
          '_dist/client/index.html': [
            '_dist/client/app/**/*.html'
          ]
          '_dist/client/admin-index.html': [
            '_dist/client/app-admin/**/*.html'
          ]

    replace:
      livereload:
        src: ["_dist/client/index.html","_dist/client/admin-index.html"]
        overwrite: true
        replacements: [
          from: '<!--LIVERELOAD-->'
          to: '<script src="//localhost:30002/livereload.js"></script>'
        ]

    concurrent:
      tasks: ['nodemon', 'watch', 'open']
      options:
        logConcurrentOutput: true


  grunt.registerTask "build", ->
    if debug
      grunt.task.run [
        "clean:all"
        "bower"
        "copy"
        "coffee"
        "less"
        "sails-linker"
        "replace:livereload"
      ]
    else
      grunt.task.run [
        "clean:all"
        "bower"
        "copy"
        "coffee"
        "less"
        "uglify"
        "cssmin"
        "sails-linker"
        "inline_angular_templates"
        "clean:redundant"
      ]

  grunt.registerTask "default", [
    'build'
    'connect'
    'concurrent'
  ]