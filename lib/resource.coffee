_ = require 'lodash'
mongoose = require 'mongoose'
config = require './config'

module.exports =
    register: (params) ->
      app = config.get('app')
      prefix = config.get('prefix')
      globalQueryLimit = config.get('queryLimit')

      resource = params.url
      modelName = Object.keys(params.model)

      if modelName.length == 1 and typeof params.model[modelName[0]] == 'object'
        modelName = modelName[0]
        model = params.model[modelName]
      else
        modelName = resource
        model = params.model
      mongooseModel = mongoose.model(modelName, model)
      options = _.extend(globalQueryLimit, params.options) || {}
      after = params.after || []
      before = params.before || []
      actions = params.actions || []

      routes =
        'create':
          method: 'post'
          url: "/#{prefix}#{resource}"
          controller: require './request/handle/post'
        'update':
          method: 'put'
          url: "/#{prefix}#{resource}/:id"
          controller: require './request/handle/put'
        'del':
          method: 'del'
          url: "/#{prefix}#{resource}/:id"
          controller: require './request/handle/delete'
        'read':
          method: 'get'
          url: "/#{prefix}#{resource}/:id"
          controller: require('./request/handle/get').get
        'readAll':
          method: 'get'
          url: "/#{prefix}#{resource}"
          controller: require('./request/handle/get').getAll

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
              before[method] && before[method](req, res)
              controller(req, res, next, mongooseModel, after[method], options)

      for key, value of actions
        do (key, value) ->
          app.post "/#{prefix}#{resource}/:id#{key}", (req, res, next) ->
            if value.auth
              value.auth() && value.handle(req, res, next)
            else
              value.handle(req, res, next)

checkAuth = (req, res, auth, method) ->
  for item in auth
    if method in item.methods && !item.valid(req)
      res.send 401
      return false
  return true
