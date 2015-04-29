_ = require("lodash")

module.exports = (req, mongooseModel) ->
  new Promise (resolve, reject) ->
    mongooseModel.findOne
      _id: req.params.id
    , (err, entity) ->
      if err
        return reject err

      unless entity
        return reject status: 404, text: 'Not Found'

      originEntity = JSON.parse(JSON.stringify(entity))
      entity = _.extend(entity, req.body)
      entity.save (err) ->
        if err
          return reject err

        return resolve entity: entity, originEntity: originEntity
