exports.get = (req, res, next, mongooseModel) ->
  mongooseModel.findOne
    _id: req.params.id
  , (err, entity) ->
    next(err)  if err
    next(new Error("Failed to find #{url} [#{req.params.id}]"))  unless entity
    res.jsonp(entity)

exports.getAll = (req, res, next, mongooseModel, options) ->
  resData = {}
  require('./query-parser/$count')(resData, mongooseModel, req.query['$count'], req.query['$filter'])

  query = mongooseModel.find()
  require('./query-parser/$filter')(query, req.query['$filter'])
  require('./query-parser/$orderby')(query, req.query['$orderby'] || options.defaultOrderby)
  require('./query-parser/$skip')(query, req.query['$skip'] || options.maxSkip)
  require('./query-parser/$top')(query, req.query['$top'] || options.maxTop)
  require('./query-parser/$select')(query, req.query['$select'])

  # todo
  # $expand=Customers/Orders
  # $search

  query.exec (err, data) ->
    resData.value = data
    res.jsonp resData
