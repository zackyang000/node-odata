mongoose = require 'mongoose'


_options =
  app : undefined  # app express instants
  db : undefined   # mongoDB address
  prefix : 'oData' # api url prefix

module.exports =
  get: (key) ->
    _options[key]

  set: (key, value) ->
    if key == 'db'
      throw new Error("db already set before, you can't set it again.")  if _options[key]
      mongoose.connect(value)

    _options[key] = value