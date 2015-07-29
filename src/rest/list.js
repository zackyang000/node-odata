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
      resolve({ entity: content });
    }).catch(function(err){
      reject({status: 500, text: err});
    });
  });
};

function countQuery(model, { count, filter }) {
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

function dataQuery(model, { filter, orderby, skip, top, select }, options) {
  return new Promise((resolve, reject) => {
    let query = model.find();
    filterParser(query, filter).then(function() {
      orderbyParser(query, orderby || options.orderby);
    }).then(function() {
      skipParser(query, skip, options.maxSkip);
    }).then(function() {
      topParser(query, top, options.maxTop);
    }).then(function() {
      selectParser(query, select);
    }).then(function() {
      query.exec((err, data) => {
        if (err) {
          return reject(err);
        }
        resolve({ key: 'value', value: data });
      });
    }).catch(function(err) {
      reject(err);
    });
  });
}
