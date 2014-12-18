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
          config: rest.post || rest.create
        'update':
          method: 'put'
          url: "/#{prefix}#{resource}/:id"
          controller: require './request/handle/put'
          config: rest.put || rest.update
        'del':
          method: 'del'
          url: "/#{prefix}#{resource}/:id"
          controller: require './request/handle/delete'
          config: rest.delete || rest.del
        'read':
          method: 'get'
          url: "/#{prefix}#{resource}/:id"
          controller: require('./request/handle/get').get
          config: rest.get || rest.read
        'readAll':
          method: 'get'
          url: "/#{prefix}#{resource}"
          controller: require('./request/handle/get').getAll
          config: rest.getAll

      auth = []
      for key, value of params.auth
        auth.push
          methods: key.toLowerCase().split(',')
          valid: value

      for name, route of routes
        method = route.method
        url = route.url
        controller = route.controller
        do (name, method, url, controller) ->
          app[method] url, (req, res, next) ->
            if checkAuth(req, res, auth, method)
              route.config.before && route.config.before(req, res)
              controller(req, res, next, mongooseModel, route.config.after, options)

      for key, value of actions
        do (key, value) ->
          app.post "/#{prefix}#{resource}/:id#{key}", (req, res, next) ->
            if value.auth
              value.auth(req) && value.handle(req, res, next)
            else
              value.handle(req, res, next)

checkAuth = (req, res, auth, method) ->
  for item in auth
    if method in item.methods && !item.valid(req)
      res.send 401
      return false
  return true
