_ = require("lodash")
config = require '../../../config'
SYSTEM_MAX_TOP = 1000000

# ?$top=10
# ->
# query.top(10)
module.exports = (query, top, maxTop) ->
  top =  _.min([SYSTEM_MAX_TOP, config.get('maxTop'), maxTop, top])
  top = SYSTEM_MAX_TOP  if top < 0
  query.limit(top)
  return
