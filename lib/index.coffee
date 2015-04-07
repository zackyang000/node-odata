express = require 'express'
mongoose = require 'mongoose'
config = require './config'
resources = require './resource'
functions = require './function'


createODataService = ->
  app = express()
  app.use express.bodyParser()
  app.use express.query()
  app.use express.methodOverride()

  app.use (req, res, next) ->
    res.removeHeader("X-Powered-By")
    next()

  config.set('app', app)
  
  server = {}

  server._app = app
  server.listen = () -> app.listen.apply(app, arguments)
  server.use = () -> app.use.apply(app, arguments)
  server.resources = resources
  server.functions = functions
  server.get = config.get
  server.set = config.set
  server.mongoose = mongoose

  return server
  

module.exports = createODataService

module.exports.express = express
