mongoose = require 'mongoose'

isField = (obj) ->
  return true  if typeof obj is 'function'
  if typeof obj is 'object'
    if obj.type and typeof obj.type is 'function'
      # 检测该 obj 下字段, 如果有除了 type 以外是 function 类型的字段, 表明该 obj 不是基本类型
      for name of obj
        if name != 'type' and typeof obj[name] is 'function'
          return false
      return true

isArray = (obj) ->
  Array.isArray obj and obj.length >= 0

isComplexArray = (obj) ->
  isArray obj and isField(obj[0])

isObject = (obj) ->
  obj and typeof obj is 'object' and !isArray(obj) and !isField(obj)


module.exports =
  toMetadata: (obj) ->
    convert = (obj, name, root) ->
      LEN = 'function '.length
      if isField(obj[name])
        if typeof obj[name] is 'function'
          obj[name] = obj[name].toString()
          obj[name] = obj[name].substr(LEN, obj[name].indexOf('(') - LEN)
        else if typeof obj[name] is 'object'
          obj[name].type = obj[name].type.toString()
          obj[name].type = obj[name].type.substr(LEN, obj[name].type.indexOf('(') - LEN)
      else if isComplexArray(obj[name])
        convert(obj[name][0], childName)  for childName of obj[name][0]
      else if isArray(obj[name])
        obj[name][0] = obj[name][0].toString()
        obj[name][0] = obj[name][0].substr(LEN, obj[name][0].indexOf('(') - LEN)
      else if isObject(obj[name])
        convert(obj[name], childName)  for childName of obj[name]

    convert obj: obj, 'obj', true

    return obj
