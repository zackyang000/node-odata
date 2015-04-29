module.exports = (req, mongooseModel) ->
  new Promise (resolve, reject) ->
    mongooseModel.remove
      _id: req.params.id
    , (err, result) ->
      if err
        return reject err

      if JSON.parse(result).n is 0
        return reject status: 404, text: 'Not Found'

      return resolve()
