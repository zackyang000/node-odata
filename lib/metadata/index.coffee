config = require './../config'

entitiesList = []
entitiesDetail = {}

add = (resource, entity) ->
  entitiesList.push resource
  entitiesDetail[resource] = parse(entity)
  build()

parse = (entity) ->
  fields = {}
  for name of entity
    field = entity[name]
    LEN = 'function '.length
    if typeof field is 'function'
      type = field.toString()
    else if typeof field is 'object'
      type = field.type.toString()
      description = field.description
    fields[name] =
      type: type.substr(LEN, type.indexOf('(') - LEN)
      description: description
  return fields

build = (entity) ->
  app = config.get('app')
  prefix = config.get('prefix') || '/'
  console.log "#{prefix}/\$metadata"
  app.get "#{prefix}", (req, res, next) ->
    res.json entities: entitiesList

  app.get "#{prefix}/__metadata", (req, res, next) ->
    res.json entitiesDetail

module.exports =
  add: add
