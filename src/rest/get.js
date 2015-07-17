"use strict";

import countParser from '../parser/countParser';
import filterParser from '../parser/filterParser';
import orderbyParser from '../parser/orderbyParser';
import skipParser from '../parser/skipParser';
import topParser from '../parser/topParser';
import selectParser from '../parser/selectParser';

export default (req, MongooseModel) => {
  return new Promise((resolve, reject) => {
    MongooseModel.findOne({ _id: req.params.id }, (err, entity) => {
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
