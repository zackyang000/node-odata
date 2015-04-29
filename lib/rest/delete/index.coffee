module.exports = (req, res, next, mongooseModel) ->
  new Promise (resolve, reject) ->
    mongooseModel.remove
      _id: req.params.id
    , (err, result) ->
      if err
        return reject err

      if JSON.parse(result).n is 0
        return reject status: 404, body: 'Not Found'

      res.send(200).end()
      return resolve()
