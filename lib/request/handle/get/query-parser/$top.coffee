_ = require("lodash")

# ?$top=10
# ->
# query.top(10)
module.exports = (query, top, maxTop) ->
  return unless top || maxTop

  top = +top

  throw new Error("Incorrect format for $top argument, '#{top}' must be a numeric type.")  if top != top
  throw new Error("Incorrect format for $top argument, '#{top}' must be great than 0.")  if top < 0

  top = _.min([top, maxTop])  if _.isNumber(maxTop)

  query.limit(top)