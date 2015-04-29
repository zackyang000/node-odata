_ = require 'lodash'

config = require './../config'
model = require './../model'

module.exports =
    register: (params) ->
      app = config.get('app')
      prefix = config.get('prefix')

      options = params.options || {}
      rest = params.rest || {}
      actions = params.actions || []

      resourceURL = "#{prefix}/#{params.url}"
      routes =
        'create':
          method: 'post'
          url: "#{resourceURL}"
          controller: require './post'
          config: rest.post || rest.create || {}
        'update':
          method: 'put'
          url: "#{resourceURL}/:id"
          controller: require './put'
          config: rest.put || rest.update || {}
        'del':
          method: 'del'
          url: "#{resourceURL}/:id"
          controller: require './delete'
          config: rest.delete || rest.del || {}
        'read':
          method: 'get'
          url: "#{resourceURL}/:id"
          controller: require('./get').get
          config: rest.get || rest.read || {}
        'readAll':
          method: 'get'
          url: "#{resourceURL}"
          controller: require('./get').getAll
          config: rest.getAll || rest.readAll || {}

      mongooseModel = model.get(params.url)

      for name, route of routes
        do (name, route) ->
          app[route.method] route.url, (req, res, next) ->
            if checkAuth(route.config.auth, req)
              route.config.before && route.config.before(req, res)
              route.controller(req, res, next, mongooseModel, options).then route.config.after, (err) ->
                if err.status
                  console.log err.status
                  res.status(err.status).send(err.body || '').end()
                else
                  next err
            else
              res.send 401

      for url, action of actions
        do (url, action) ->
          app.post "#{resourceURL}/:id#{url}", (req, res, next) ->
            if checkAuth(action.auth)
              action(req, res, next)


checkAuth = (auth, req) ->
  unless auth
    return true
  return auth(req)
