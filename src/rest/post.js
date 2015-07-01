"use strict";

export default (req, mongooseModel) => {
  return new Promise((resolve, reject) => {
    if (!Object.keys(req.body).length) {
      return reject({status: 422});
    }

    /* jshint -W055 */
    let entity = new mongooseModel(req.body);
    entity.save((err) => {
      if (err) {
        return reject(err);
      }
      return resolve({status: 201, entity: entity});
    });
  });
};
