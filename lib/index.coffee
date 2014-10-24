_ = require("lodash")
mongoose = require('mongoose')
create = require("./create")
update = require("./update")
read = require("./read")
del = require("./delete")

_options =
  app : undefined
  db : undefined
  prefix : 'oData'

register = (params) ->
  app = _options.app
  url = params.url
  modelName = params.modelName
  mongooseModel = mongoose.model(modelName || url, params.model)
  options = _.extend(_options, params.options)
  actions = params.actions || []
  after = params.after || []
  before = params.before || []

  auth = []
  for key, value of params.auth
    auth.push
      methods: key.toLowerCase().split(',')
      valid: value

  app.post "/#{_options.prefix}#{url}", (req, res, next) ->
    if checkAuth(req, res, auth, 'post')
      before.post && before.post(req, res)
      create(req, res, next, mongooseModel, after.post)

  app.put "/#{_options.prefix}#{url}/:id", (req, res, next) ->
    if checkAuth(req, res, auth, 'put')
      before.put && before.put(req, res)
      update(req, res, next, mongooseModel, after.put)

  app.del "/#{_options.prefix}#{url}/:id", (req, res, next) ->
    if checkAuth(req, res, auth, 'delete')
      before.post && before.post(req, res)
      del(req, res, next, mongooseModel, after.post)

  app.get "/#{_options.prefix}#{url}/:id", (req, res, next) ->
    if checkAuth(req, res, auth, 'get')
      before.get && before.get.get(req, res)
      read.get(req, res, next, mongooseModel, after.get)

  app.get "/#{_options.prefix}#{url}", (req, res, next) ->
    if checkAuth(req, res, auth, 'get')
      before.get && before.get(req, res)
      read.getAll(req, res, next, mongooseModel, options, after.get)

  for key, value of actions
    ((key1, value1)->
      app.post "/#{_options.prefix}#{url}/:id#{key1}", (req, res, next) ->
        if value1.auth
          value1.auth() && value1.handle(req, res, next)
        else
          value1.handle(req, res, next)
    )(key, value)



registerFunction = (params) ->
  url = params.url
  method = params.method
  handle = params.handle
  _options.app[method.toLowerCase()]("/#{_options.prefix}#{url}", handle)


set = (key, value) ->
  if key == 'db'
    if _options[key]
      throw new Error("db already set before, you can't set it again.")
    _options[key] = value
    mongoose.connect(value)
  else
    _options[key] = value

checkAuth = (req, res, auth, method) ->
  for item in auth
    if method in item.methods && !item.valid(req)
      res.send 401
      return false
  return true

exports.resources =
  register: register
exports.functions =
  register: registerFunction
exports.mongoose = mongoose
exports.set = set
