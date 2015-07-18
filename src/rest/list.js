"use strict";

import countParser from '../parser/countParser';
import filterParser from '../parser/filterParser';
import orderbyParser from '../parser/orderbyParser';
import skipParser from '../parser/skipParser';
import topParser from '../parser/topParser';
import selectParser from '../parser/selectParser';

export default (req, MongooseModel, options) => {
  return new Promise((resolve, reject) => {
    let resData = {};

    let query = MongooseModel.find();

    let errHandle = (err) => {
      err.status = 500;
      return reject(err);
    };


    // TODO: use Promise
    let err = countParser(resData, MongooseModel, req.query.$count, req.query.$filter);
    if(err) {
      return errHandle(err);
    }

    err = filterParser(query, req.query.$filter);
    if(err) {
      return errHandle(err);
    }

    err = orderbyParser(query, req.query.$orderby || options.orderby);
    if(err) {
      return errHandle(err);
    }

    err = skipParser(query, req.query.$skip, options.maxSkip);
    if(err) {
      return errHandle(err);
    }

    err = topParser(query, req.query.$top, options.maxTop);
    if(err) {
      return errHandle(err);
    }

    err = selectParser(query, req.query.$select);
    if(err) {
      return errHandle(err);
    }

    // TODO
    // $expand=Customers/Orders
    // $search

    query.exec((err, data) => {
      resData.value = data;
      return resolve({entity: resData});
    });
  });
};

