module.exports = (req, res, next, mongooseModel, cb) ->
  mongooseModel.remove
    _id: req.params.id
  , (err, count) ->
    if err
      next(err)
      return
    if count is 0
      res.send(404)
      return
    res.send(204)
    cb()  if cb