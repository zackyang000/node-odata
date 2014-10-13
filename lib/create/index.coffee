module.exports = (req, res, next, mongooseModel) ->
  if Object.keys(req.body).length is 0
    res.status(422, 'Your request was understood, but contained invalid parameters').end()
    return
  entity = new mongooseModel(req.body)
  entity.save (err) ->
    next(err)  if err
    res.status(201).jsonp(entity)