module.exports = (req, res, next, mongooseModel) ->
  new Promise (resolve, reject) ->
    mongooseModel.remove
      _id: req.params.id
    , (err, result) ->
      if err
        next err
        return reject err

      if JSON.parse(result).n is 0
        res.status(404).send('Not Found').end()
        return reject 404

      res.send(200).end()
      return resolve()
