_ = require("lodash")

module.exports = (req, res, next, mongooseModel) ->
  mongooseModel.findOne
    _id: req.params.id
  , (err, entity) ->
    if err
      next(err)
      return
    unless entity
      res.status(404, 'Not Found').end()
      return
    entity = _.extend(entity, req.body)
    entity.save (err) ->
      next(err)  if err
      res.jsonp(entity)