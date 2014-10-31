_ = require("lodash")
mongoose = require('mongoose')
handlers =
  create : require("./request/handle/post")
  update : require("./request/handle/put")
  del : require("./request/handle/delete")
  read : require("./request/handle/get").get
  readAll : require("./request/handle/get").getAll

_options =
  app : undefined
  db : undefined
  prefix : 'oData'


registerResource = (params) ->
  app = _options.app
  prefix = _options.prefix

  resource = params.url
  modelName = params.modelName || resource
  mongooseModel = mongoose.model(modelName, params.model)
  options = _.extend(_options, params.options)
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
  register: registerResource
exports.functions =
  register: registerFunction
exports.mongoose = mongoose
exports.set = set
