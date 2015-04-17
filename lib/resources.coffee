rest = require './rest'
metadata = require './metadata'

module.exports =
    register: (params) ->
      rest.register params
      metadata.register params
