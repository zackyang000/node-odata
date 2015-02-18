_ = require 'lodash'
mongoose = require 'mongoose'
config = require './config'
metadata = require './metadata'
id = require './mongodb/idPlugin'

module.exports =
    register: (params) ->
      app = config.get('app')
      prefix = config.get('prefix')
      globalQueryLimit = config.get('queryLimit')

      params.url = params.url[1..]  if params.url.indexOf('/') is 0
      if params.url.indexOf('/') >= 0
        throw new Error("Resource of url can't contain '/', it can only be allowed to exist in the beginning.")

      resource = params.url
      model = params.model

      metadata.add(resource, model)
      schema = new mongoose.Schema(model, { _id: false, versionKey: false, collection: resource })
      schema.plugin(id)
      mongooseModel = mongoose.model resource, schema

      options = _.extend(globalQueryLimit, params.options) || {}
      rest = params.rest || {}
      actions = params.actions || []

      resource = "#{prefix}/#{resource}"

      routes =
        'create':
          method: 'post'
          url: "#{resource}"
          controller: require './request/handle/post'
          config: rest.post || rest.create || {}
        'update':
          method: 'put'
          url: "#{resource}/:id"
          controller: require './request/handle/put'
          config: rest.put || rest.update || {}
        'del':
          method: 'del'
          url: "#{resource}/:id"
          controller: require './request/handle/delete'
          config: rest.delete || rest.del || {}
        'read':
          method: 'get'
          url: "#{resource}/:id"
          controller: require('./request/handle/get').get
          config: rest.get || rest.read || {}
        'readAll':
          method: 'get'
          url: "#{resource}"
          controller: require('./request/handle/get').getAll
          config: rest.getAll || rest.readAll || {}

      for name, route of routes
        do (name, route) ->
          app[route.method] route.url, (req, res, next) ->
            if checkAuth(route.config.auth, req, res)
              route.config.before && route.config.before(req, res)
              route.controller(req, res, next, mongooseModel, route.config.after, options)

      for url, action of actions
        do (url, action) ->
          app.post "#{resource}/:id#{url}", (req, res, next) ->
            if checkAuth(action.auth)
              action(req, res, next)

checkAuth = (auth, req, res) ->
  if auth && !auth(req)
    res.send 401
    return false
  return true
