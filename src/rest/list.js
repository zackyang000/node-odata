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
      return reject({status: 500}, {text: err});
    };

    let params = {
      count: req.query.$count,
      filter: req.query.$filter,
      orderby: req.query.$orderby,
      skip: req.query.$skip,
      top: req.query.$top,
      select: req.query.$select,
      // TODO expand: req.query.$expand,
      // TODO search: req.query.$search,
    };

    // TODO: use Promise
    let err = countParser(resData, MongooseModel, params.count, req.query.$filter);
    if(err) {
      return errHandle(err);
    }

    err = filterParser(query, params.filter);
    if(err) {
      return errHandle(err);
    }

    err = orderbyParser(query, params.orderby || options.orderby);
    if(err) {
      return errHandle(err);
    }

    err = skipParser(query, params.skip, options.maxSkip);
    if(err) {
      return errHandle(err);
    }

    err = topParser(query, params.top, options.maxTop);
    if(err) {
      return errHandle(err);
    }

    err = selectParser(query, params.select);
    if(err) {
      return errHandle(err);
    }

    query.exec((err, data) => {
      if (err) {
        reject(err);
      }
      resData.value = data;
      return resolve({entity: resData});
    });
  });
};

