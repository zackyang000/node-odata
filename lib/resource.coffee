_ = require 'lodash'
mongoose = require 'mongoose'
config = require './config'


module.exports =
    register: (params) ->
      app = config.get('app')
      prefix = config.get('prefix')
      globalQueryLimit = config.get('queryLimit')

      resource = params.url
      model = params.model

      mongooseModel = mongoose.model(resource, model)
      options = _.extend(globalQueryLimit, params.options) || {}
      rest = params.rest || {}
      actions = params.actions || []

      routes =
        'create':
          method: 'post'
          url: "/#{prefix}#{resource}"
          controller: require './request/handle/post'
          config: rest.post || rest.create || {}
        'update':
          method: 'put'
          url: "/#{prefix}#{resource}/:id"
          controller: require './request/handle/put'
          config: rest.put || rest.update || {}
        'del':
          method: 'del'
          url: "/#{prefix}#{resource}/:id"
          controller: require './request/handle/delete'
          config: rest.delete || rest.del || {}
        'read':
          method: 'get'
          url: "/#{prefix}#{resource}/:id"
          controller: require('./request/handle/get').get
          config: rest.get || rest.read || {}
        'readAll':
          method: 'get'
          url: "/#{prefix}#{resource}"
          controller: require('./request/handle/get').getAll
          config: rest.getAll || {}

      for name, route of routes
        do (name, route) ->
          app[route.method] route.url, (req, res, next) ->
            if checkAuth(route.config.auth, req, res)
              route.config.before && route.config.before(req, res)
              route.controller(req, res, next, mongooseModel, route.config.after, options)

      for url, action of actions
        do (url, action) ->
          app.post "/#{prefix}#{resource}/:id#{url}", (req, res, next) ->
            if checkAuth(action.auth)
              action(req, res, next)

checkAuth = (auth, req, res) ->
  if auth && !auth(req)
    res.send 401
    return false
  return true
