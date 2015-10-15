"use strict";

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
