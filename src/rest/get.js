"use strict";

import countParser from '../parser/countParser';
import filterParser from '../parser/filterParser';
import orderbyParser from '../parser/orderbyParser';
import skipParser from '../parser/skipParser';
import topParser from '../parser/topParser';
import selectParser from '../parser/selectParser';

const get = (req, mongooseModel) => {
  return new Promise((resolve, reject) => {
    mongooseModel.findOne({ _id: req.params.id }, (err, entity) => {
      if (err) {
        return reject(err);
      }

      if (!entity) {
        return reject({status: 404}, {text: 'Not Found'});
      }

      return resolve({entity: entity});
    });
  });
};

const getAll = (req, mongooseModel, options) => {
  return new Promise((resolve, reject) => {
    let resData = {};

    let query = mongooseModel.find();

    let errHandle = (err) => {
      err.status = 500;
      return reject(err);
    };
    let err;

    /*jshint -W084 */
    if(err = countParser(resData, mongooseModel, req.query.$count, req.query.$filter)) {
      return errHandle(err);
    }

    /*jshint -W084 */
    if(err = filterParser(query, req.query.$filter)) {
      return errHandle(err);
    }

    /*jshint -W084 */
    if(err = orderbyParser(query, req.query.$orderby || options.orderby)) {
      return errHandle(err);
    }

    /*jshint -W084 */
    if(err = skipParser(query, req.query.$skip, options.maxSkip)) {
      return errHandle(err);
    }

    /*jshint -W084 */
    if(err = topParser(query, req.query.$top, options.maxTop)) {
      return errHandle(err);
    }

    /*jshint -W084 */
    if(err = selectParser(query, req.query.$select)) {
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

export default { get, getAll };
