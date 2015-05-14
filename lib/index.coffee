express = require 'express'
mongoose = require 'mongoose'

config = require './config'
resources = require './resources'
functions = require './functions'
metadata = require './metadata'


createService = (db, prefix) ->
  app = express()
  app.use express.bodyParser()
  app.use express.query()
  app.use express.methodOverride()

  app.use (req, res, next) ->
    res.removeHeader("X-Powered-By")
    next()

  config.set('app', app)
  config.set('db', db)
  config.set('db', prefix)
  
  server = {}

  server.listen = () ->
    metadata.build()
    app.listen.apply(app, arguments)

  server.use = () ->
    app.use.apply(app, arguments)

  server.config =
    get : config.get
    set : config.set

  server.resources = resources

  server._app = app

  server.mongoose = mongoose

  # functions
  server.functions = functions
  ['get', 'put', 'del', 'post'].map (method) ->
    server[method] = (url, handle, auth) ->
      functions.register
        url: url
        method: method
        handle: handle
        auth: auth

  return server

module.exports = createService
module.exports.express = express
module.exports.mongoose = mongoose
