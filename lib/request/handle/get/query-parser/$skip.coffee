_ = require("lodash")

# ?$skip=10
# ->
# query.skip(10)
module.exports = (query, skip, maxSkip) ->
  return unless skip || maxSkip

  skip = +skip

  throw new Error("Incorrect format for $skip argument, '#{skip}' must be a numeric type.")  if skip != skip
  throw new Error("Incorrect format for $skip argument, '#{skip}' must be great than 0.")  if skip < 0

  skip = _.min([skip, maxSkip])  if _.isNumber(maxSkip)

  query.skip(skip)