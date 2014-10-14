module.exports = (req, res, next, mongooseModel) ->
  mongooseModel.remove
    _id: req.params.id
  , (err) ->
    if err
      next(err)
      return
    res.send(204)