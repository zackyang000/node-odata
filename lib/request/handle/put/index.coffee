_ = require("lodash")

module.exports = (req, res, next, mongooseModel, cb) ->
  mongooseModel.findOne
    _id: req.params.id
  , (err, entity) ->
    return next(err)  if err
    return res.status(404, 'Not Found').end()  unless entity

    newEntity = _.extend(entity, req.body)
    newEntity.save (err) ->
      next(err)  if err
      res.jsonp(newEntity)
      cb(newEntity, entity)  if cb
