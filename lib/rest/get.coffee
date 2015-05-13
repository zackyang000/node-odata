module.exports =
  get : (req, mongooseModel) ->
    new Promise (resolve, reject) ->
      mongooseModel.findOne
        _id: req.params.id
      , (err, entity) ->
        if err
          return reject err

        unless entity
          return reject status: 404, text: 'Not Found'

        return resolve entity: entity

  getAll : (req, mongooseModel, options) ->
    new Promise (resolve, reject) ->
      resData = {}

      query = mongooseModel.find()

      errHandle = (err) ->
        return reject err

      if err =require('../parser/countParser')(resData, mongooseModel, req.query['$count'], req.query['$filter'])
        return errHandle err
      if err = require('../parser/filterParser')(query, req.query['$filter'])
        return errHandle err
      if err = require('../parser/orderbyParser')(query, req.query['$orderby'] || options.orderby)
        return errHandle err
      if err = require('../parser/skipParser')(query, req.query['$skip'], options.maxSkip)
        return errHandle err
      if err = require('../parser/topParser')(query, req.query['$top'], options.maxTop)
        return errHandle err
      if err = require('../parser/selectParser')(query, req.query['$select'])
        return errHandle err

      # todo
      # $expand=Customers/Orders
      # $search

      query.exec (err, data) ->
        resData.value = data
        return resolve entity: resData
