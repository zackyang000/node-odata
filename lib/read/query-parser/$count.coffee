# ?$skip=10
# ->
# query.skip(10)
module.exports = (resData, mongooseModel, $count, $filter) ->
  return unless $count

  if $count == 'true'
    query = mongooseModel.find()
    require('./$filter')(query, $filter)
    query.count (err, count) ->
      resData['@odata.count'] = count
  else
    throw new Error('Unknown $count  option, only "true" and "false" are supported.')