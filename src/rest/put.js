"use strict";

import { extend } from 'lodash';

const uuidReg = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default (req, mongooseModel) => {
  return new Promise((resolve, reject) => {
    mongooseModel.findOne({_id: req.params.id}, (err, entity) => {
      if (err) {
        return reject(err);
      }

      if (!entity) {
        // create entity
        if (!uuidReg.test(req.params.id)) {
          return reject({ status: 400 }, { text: 'Id is not valid.' });
        }
        /* jshint -W055 */
        entity = new mongooseModel(req.body);
        entity._id = req.params.id;
        entity.save((err) => {
          if (err) {
            return reject(err);
          }
          return resolve({ status: 201, entity: entity });
        });
      } else {
        // edit entity
        let originEntity = JSON.parse(JSON.stringify(entity));
        entity = extend(entity, req.body);
        entity.save((err) => {
          if (err) {
            return reject(err);
          }

          return resolve({ entity, originEntity });
        });
      }
    });
  });
};
