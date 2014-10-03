_ = require("lodash")

module.exports = (req, res, next, mongooseModel) ->
  mongooseModel.findOne
    _id: req.params.id
  , (err, entity) ->
    next(err)  if err
    next(new Error("Failed to find #{req.params.id}"))  unless entity
    entity = _.extend(entity, req.body)
    entity.save (err) ->
      next(err)  if err
      res.jsonp(entity)