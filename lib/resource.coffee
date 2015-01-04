_ = require 'lodash'
mongoose = require 'mongoose'
config = require './config'
metadata = require './metadata'

module.exports =
    register: (params) ->
      app = config.get('app')
      prefix = config.get('prefix')
      globalQueryLimit = config.get('queryLimit')

      resource = params.url
      resource = params.url[1..]  if params.url.indexOf('/') is 0
      if resource.indexOf('/') >= 0
        throw new Error("Resource of url can't contain '/', it can only be allowed to exist in the beginning.")
      model = params.model

      metadata.add resource, model

      mongooseModel = mongoose.model(resource, model)
      options = _.extend(globalQueryLimit, params.options) || {}
      rest = params.rest || {}
      actions = params.actions || []

      routes =
        'create':
          method: 'post'
          url: "#{prefix}/#{resource}"
          controller: require './request/handle/post'
          config: rest.post || rest.create || {}
        'update':
          method: 'put'
          url: "#{prefix}/#{resource}/:id"
          controller: require './request/handle/put'
          config: rest.put || rest.update || {}
        'del':
          method: 'del'
          url: "#{prefix}/#{resource}/:id"
          controller: require './request/handle/delete'
          config: rest.delete || rest.del || {}
        'read':
          method: 'get'
          url: "#{prefix}/#{resource}/:id"
          controller: require('./request/handle/get').get
          config: rest.get || rest.read || {}
        'readAll':
          method: 'get'
          url: "#{prefix}/#{resource}"
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
          app.post "#{prefix}/#{resource}/:id#{url}", (req, res, next) ->
            if checkAuth(action.auth)
              action(req, res, next)

checkAuth = (auth, req, res) ->
  if auth && !auth(req)
    res.send 401
    return false
  return true
