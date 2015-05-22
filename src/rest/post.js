"use strict";

module.exports = function(req, mongooseModel) {
  return new Promise(function(resolve, reject) {
    if(Object.keys(req.body).length === 0)
      return reject({status: 422});

    var entity = new mongooseModel(req.body);
    entity.save(function(err) {
      if(err)
        return reject(err);
      return resolve({status: 201, entity: entity});
    });
  });
}
