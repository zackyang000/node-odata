config = require './config'

module.exports =
  register: (params) ->
    url = params.url
    method = params.method
    handle = params.handle
    app = config.get('app')
    app[method.toLowerCase()]("/#{config.get('prefix')}#{url}", handle)