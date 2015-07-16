"use strict";

import countParser from '../parser/countParser';
import filterParser from '../parser/filterParser';
import orderbyParser from '../parser/orderbyParser';
import skipParser from '../parser/skipParser';
import topParser from '../parser/topParser';
import selectParser from '../parser/selectParser';

export default (req, mongooseModel) => {
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
