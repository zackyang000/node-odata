config = require './config'

module.exports =
  register: (params) ->
    url = params.url
    method = params.method
    handle = params.handle
    app = config.get('app')
    prefix = config.get('prefix')
    app[method.toLowerCase()]("#{prefix}#{url}", handle)
