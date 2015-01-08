config = require './../config'

entitiesList = []
entitiesDetail = {}

add = (resource, entity) ->
  entitiesList.push resource
  entitiesDetail[resource] = entity
  build()



build = (entity) ->
  app = config.get('app')
  prefix = config.get('prefix')

  app.get prefix || '/', (req, res, next) ->
    res.json resources: entitiesList

  app.get "#{prefix}/__metadata", (req, res, next) ->
    res.json entitiesDetail

  for entity of entitiesDetail
    app.get "#{prefix}/__metadata/#{entity}", (req, res, next) ->
      data = {}
      data[entity] = entitiesDetail[entity]
      res.json data


module.exports =
  add: add
