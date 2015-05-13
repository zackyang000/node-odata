# ?$skip=10
# ->
# query.skip(10)
module.exports = (resData, mongooseModel, $count, $filter) ->
  return unless $count

  if $count == 'true'
    query = mongooseModel.find()
    require('./filterParser')(query, $filter)
    query.count (err, count) ->
      resData['@odata.count'] = count
  else if $count == 'false'
    return
  else
    return new Error('Unknown $count option, only "true" and "false" are supported.')
  return
