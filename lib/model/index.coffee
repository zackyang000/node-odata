mongoose = require 'mongoose'
id = require './../mongodb/idPlugin'

register = (name, model) ->
  schema = new mongoose.Schema model,
    _id: false
    versionKey: false
    collection: name
  schema.plugin(id)
  mongoose.model name, schema

get = (name) ->
  mongoose.model(name)

module.exports =
  register: register
  get: get

