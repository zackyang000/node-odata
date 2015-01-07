config = require './../config'

entitiesList = []
entitiesDetail = {}

add = (resource, entity) ->
  entitiesList.push resource
  entitiesDetail[resource] = entity
  build()



build = (entity) ->
  app = config.get('app')
  prefix = config.get('prefix') || '/'

  app.get "#{prefix}", (req, res, next) ->
    res.json entities: entitiesList

  app.get "#{prefix}/__metadata", (req, res, next) ->
    res.json entitiesDetail

module.exports =
  add: add
