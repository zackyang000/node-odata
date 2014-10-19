module.exports = (req, res, next, mongooseModel, cb) ->
  mongooseModel.remove
    _id: req.params.id
  , (err, count) ->
      return next(err)  if err
      return res.send(404)  if count is 0

      res.send(200)
      cb()  if cb