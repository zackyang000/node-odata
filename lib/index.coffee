_ = require("lodash")
mongoose = require 'mongoose'

handlers =
  create : require("./request/handle/post")
  update : require("./request/handle/put")
  del : require("./request/handle/delete")
  read : require("./request/handle/get").get
  readAll : require("./request/handle/get").getAll

config = require "./config"


module.exports =
  resources:
    register: (params) ->
      app = config.get('app')
      prefix = config.get('prefix')
      globalQueryLimit = config.get('queryLimit')

      resource = params.url
      modelName = Object.keys(params.model)
      if modelName.length == 1
        modelName = modelName[0]
        model = params.model[modelName]
      else
        modelName = resource
        model = params.model
      mongooseModel = mongoose.model(modelName, model)
      options = _.extend(globalQueryLimit, params.options) || {}
      actions = params.actions || []
      after = params.after || []
      before = params.before || []

      routes =
        'create':
          method: 'post'
          url: "/#{prefix}#{resource}"
        'update':
          method: 'put'
          url: "/#{prefix}#{resource}/:id"
        'del':
          method: 'del'
          url: "/#{prefix}#{resource}/:id"
        'read':
          method: 'get'
          url: "/#{prefix}#{resource}/:id"
        'readAll':
          method: 'get'
          url: "/#{prefix}#{resource}"

      auth = []
      for key, value of params.auth
        auth.push
          methods: key.toLowerCase().split(',')
          valid: value

      for name, route of routes
        method = route.method
        url = route.url
        do (name, method, url) ->
          app[method] url, (req, res, next) ->
            if checkAuth(req, res, auth, method)
              before[method] && before[method](req, res)
              handlers[name](req, res, next, mongooseModel, after[method], options)

      for key, value of actions
        do (key, value) ->
          app.post "/#{prefix}#{resource}/:id#{key}", (req, res, next) ->
            if value.auth
              value.auth() && value.handle(req, res, next)
            else
              value.handle(req, res, next)


  functions:
    register: (params) ->
      url = params.url
      method = params.method
      handle = params.handle
      app = config.get('app')
      app[method.toLowerCase()]("/#{config.get('prefix')}#{url}", handle)

module.exports.get = config.get
module.exports.set = config.set
module.exports.mongoose = mongoose

checkAuth = (req, res, auth, method) ->
  for item in auth
    if method in item.methods && !item.valid(req)
      res.send 401
      return false
  return true