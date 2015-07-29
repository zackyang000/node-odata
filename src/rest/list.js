"use strict";

import countParser from '../parser/countParser';
import filterParser from '../parser/filterParser';
import orderbyParser from '../parser/orderbyParser';
import skipParser from '../parser/skipParser';
import topParser from '../parser/topParser';
import selectParser from '../parser/selectParser';

export default (req, MongooseModel, options) => {
  return new Promise((resolve, reject) => {
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

    Promise.all([
      countQuery(MongooseModel, params),
      dataQuery(MongooseModel, params, options),
    ]).then(function(results) {
      let content = {};
      results.map(function(result) {
        if (result && result.key) {
          content[result.key] = result.value;
        }
      });
      resolve({entity: content});
    }).catch(function(err){
      reject({status: 500}, {text: err});
    });
  });
};

function countQuery (model, { count, filter }) {
  return new Promise((resolve, reject) => {
    countParser(model, count, filter).then(function (count) {
      if (count !== undefined) {
        resolve({ key: '@odata.count', value: count });
      } else {
        resolve();
      }
    }).catch(function(err) {
      reject(err);
    });
  });
}

function dataQuery (model, { filter, orderby, skip, top, select }, options) {
  return new Promise((resolve, reject) => {
    let query = model.find();

    let err = filterParser(query, filter);
    if(err) {
      return reject(err);
    }

    err = orderbyParser(query, orderby || options.orderby);
    if(err) {
      return reject(err);
    }

    err = skipParser(query, skip, options.maxSkip);
    if(err) {
      return reject(err);
    }

    err = topParser(query, top, options.maxTop);
    if(err) {
      return reject(err);
    }

    err = selectParser(query, select);
    if(err) {
      return reject(err);
    }

    query.exec((err, data) => {
      if (err) {
        return reject(err);
      }
      resolve({ key: 'value', value: data });
    });
  });
}
