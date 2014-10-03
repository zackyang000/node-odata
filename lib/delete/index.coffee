module.exports = (req, res, next, mongooseModel) ->
  mongooseModel.remove
    _id: req.params.id
  , (err) ->
    next(err)  if err
    res.send(204)