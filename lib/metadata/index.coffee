config = require './../config'
parser = require './parser'
entities = {}

add = (name, model) ->
  entities[name] = model

build = (entity) ->
  app = config.get('app')
  prefix = config.get('prefix')

  app.get prefix || '/', (req, res, next) ->
    resources = {}
    Object.keys(entities).map (name) ->
      resources[name] = "http://#{req.headers.host}#{prefix}/__metadata/#{name}"
    res.json resources: resources

  Object.keys(entities).map (name) ->
    app.get "#{prefix}/__metadata/#{name}", (req, res, next) ->
      data = {}
      data[name] = parser.toMetadata entities[name]
      res.json data

module.exports =
  add: add
  build: build
