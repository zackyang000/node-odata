module.exports = (req, res, next, mongooseModel, cb) ->
  if Object.keys(req.body).length is 0
    return res.status(422, 'Your request was understood, but contained invalid parameters').end()
  entity = new mongooseModel(req.body)
  entity.save (err) ->
    return next(err)  if err

    res.status(201).jsonp(entity)
    cb(entity)  if cb
