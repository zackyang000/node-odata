"use strict";

import { extend } from 'lodash'

module.exports = (req, mongooseModel) => {
  return new Promise((resolve, reject) => {
    mongooseModel.findOne({_id: req.params.id}, (err, entity) => {
      if (err) {
        return reject(err);
      }

      if (!entity) {
        return reject({status: 404}, {text: 'Not Found'});
      }

      let originEntity = JSON.parse(JSON.stringify(entity));
      entity = extend(entity, req.body);
      entity.save((err) => {
        if (err) {
          return reject(err);
        }

        return resolve({ entity, originEntity });
      });
    });
  });
}
