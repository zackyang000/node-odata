module.exports = (req, res, next, mongooseModel) ->
  entity = new mongooseModel(req.body)
  entity.save (err) ->
    next(err)  if err
    res.jsonp(entity)