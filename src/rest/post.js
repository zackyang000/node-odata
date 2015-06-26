"use strict";

export default (req, MongooseModel) => {
  return new Promise((resolve, reject) => {
    if (!Object.keys(req.body).length) {
      return reject({status: 422});
    }

    let entity = new MongooseModel(req.body);
    entity.save((err) => {
      if (err) {
        return reject(err);
      }
      return resolve({status: 201, entity: entity});
    });
  });
};
