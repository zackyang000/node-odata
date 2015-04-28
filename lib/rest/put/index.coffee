_ = require("lodash")

module.exports = (req, res, next, mongooseModel) ->
  new Promise (resolve, reject) ->
    mongooseModel.findOne
      _id: req.params.id
    , (err, entity) ->
      if err
        next err
        return reject err

      unless entity
        res.status(404).send('Not Found').end()
        return reject 404

      oldEntity = JSON.parse(JSON.stringify(entity))
      entity = _.extend(entity, req.body)
      entity.save (err) ->
        if err
          next err
          return reject err

        res.jsonp(entity)
        return resolve entity
