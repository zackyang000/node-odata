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

    let data = {};
    Promise.all([
      countQuery(MongooseModel, params),
      dataQuery(MongooseModel, params, options),
    ]).then(function(results) {
      results.map(function(result) {
        if (typeof result === 'number') {
          data['@odata.count'] = result;
        } else if (result instanceof Array) {
          data.value = result;
        }
      });
      return resolve({entity: data});
    }).catch(function(err){
      reject({status: 500}, {text: err});
    });
  });
};

function countQuery (model, { count, filter }) {
  return countParser(model, count, filter);
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
      resolve(data);
    });
  });
}
