"use strict";

module.exports = {
  get : function(req, mongooseModel) {
    return new Promise(function(resolve, reject) {
      mongooseModel.findOne({_id: req.params.id}, function(err, entity) {
        if(err)
          return reject(err);

        if(!entity)
          return reject({status: 404}, {text: 'Not Found'});

        return resolve({entity: entity});
      });
    });
  },

  getAll : function(req, mongooseModel, options) {
    return new Promise(function(resolve, reject) {
      var resData = {};

      var query = mongooseModel.find();

      var errHandle = function(err) {
        return reject(err);
      }
      var err = undefined;

      if(err = require('../parser/countParser')(resData, mongooseModel, req.query['$count'], req.query['$filter']))
        return errHandle(err);
      if(err = require('../parser/filterParser')(query, req.query['$filter']))
        return errHandle(err);
      if(err = require('../parser/orderbyParser')(query, req.query['$orderby'] || options.orderby))
        return errHandle(err);
      if(err = require('../parser/skipParser')(query, req.query['$skip'], options.maxSkip))
        return errHandle(err);
      if(err = require('../parser/topParser')(query, req.query['$top'], options.maxTop))
        return errHandle(err);
      if(err = require('../parser/selectParser')(query, req.query['$select']))
        return errHandle(err);

      // # todo
      // # $expand=Customers/Orders
      // # $search

      query.exec(function(err, data) {
        resData.value = data;
        return resolve({entity: resData});
      });
    });
  }
}
