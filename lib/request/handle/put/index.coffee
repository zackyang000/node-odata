_ = require("lodash")

module.exports = (req, res, next, mongooseModel, cb) ->
  mongooseModel.findOne
    _id: req.params.id
  , (err, entity) ->
    return next(err)  if err
    return res.status(404, 'Not Found').end()  unless entity
    oldEntity = JSON.parse(JSON.stringify(entity))
    entity = _.extend(entity, req.body)
    entity.save (err) ->
      next(err)  if err
      res.jsonp(entity)
      cb(entity, oldEntity)  if cb
