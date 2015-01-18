module.exports = (req, res, next, mongooseModel, cb) ->
  mongooseModel.remove
    _id: req.params.id
  , (err, count) ->
      return next(err)  if err
      return res.status(404, 'Not Found').send('Not Found').end()  if count is 0

      res.send(200)
      cb()  if cb
