mongoose = require 'mongoose'

isField = (obj) ->
  return true  if typeof obj is 'function'
  if typeof obj is 'object'
    if obj.type and typeof obj.type is 'function'
      return true

isArray = (obj) ->
  Array.isArray obj

isObject = (obj) ->
  obj and typeof obj is 'object' and !isArray(obj) and !isField(obj)



module.exports =
  toMongoose: (resource, obj) ->
    convert = (obj, name) ->
      if isArray(obj[name])
        convert(obj[name], childName) for childName of obj
        obj[name] = [new mongoose.Schema(obj[name][0])]
      else if isObject(obj[name])
        convert(obj[name], childName) for childName of obj

    convert obj: obj, 'obj'
    mongoose.model(resource, obj)

  toMetadata: (resource, obj) ->
