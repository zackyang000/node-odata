_ = require("lodash")

module.exports = (req, res, next, mongooseModel) ->
  new Promise (resolve, reject) ->
    mongooseModel.findOne
      _id: req.params.id
    , (err, entity) ->
      if err
        return reject err

      unless entity
        return reject status: 404, body: 'Not Found'

      oldEntity = JSON.parse(JSON.stringify(entity))
      entity = _.extend(entity, req.body)
      entity.save (err) ->
        if err
          return reject err

        res.jsonp(entity)
        return resolve entity
