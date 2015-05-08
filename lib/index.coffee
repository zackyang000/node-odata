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
  config.set('db', db)  if db
  config.set('db', prefix)  if prefix
  
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
  server.functions = functions

  server._app = app

  server.mongoose = mongoose

  return server

module.exports = createService
module.exports.express = express
module.exports.mongoose = mongoose
