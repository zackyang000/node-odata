module.exports = (req, res, next, mongooseModel) ->
  new Promise (resolve, reject) ->
    if Object.keys(req.body).length is 0
      return reject status: 422

    entity = new mongooseModel(req.body)
    entity.save (err) ->
      if err
        return reject err

      res.status(201).jsonp(entity)
      return resolve entity
