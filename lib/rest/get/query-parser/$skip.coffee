_ = require("lodash")
config = require '../../../config'

# ?$skip=10
# ->
# query.skip(10)
module.exports = (query, skip, maxSkip) ->
  skip =  _.min([config.get('maxSkip'), maxSkip, skip])
  return  if skip < 0
  query.skip(skip)
  return
