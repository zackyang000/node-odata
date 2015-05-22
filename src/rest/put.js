"use strict";

import _ from 'lodash'

module.exports = function(req, mongooseModel) {
  return new Promise(function(resolve, reject) {
    mongooseModel.findOne({_id: req.params.id}, function(err, entity) {
      if(err)
        return reject(err);

      if(!entity)
        return reject({status: 404}, {text: 'Not Found'});

      var originEntity = JSON.parse(JSON.stringify(entity));
      var entity = _.extend(entity, req.body);
      entity.save(function(err) {
        if(err)
          return reject(err);

        return resolve({entity: entity}, {originEntity: originEntity});
      });
    });
  });
}
