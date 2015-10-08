'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _lodash = require('lodash');

var uuidReg = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

exports['default'] = function (req, MongooseModel) {
  return new Promise(function (resolve, reject) {
    MongooseModel.findOne({ _id: req.params.id }, function (err, entity) {
      if (err) {
        return reject(err);
      }

      if (!entity) {
        // create entity
        if (!uuidReg.test(req.params.id)) {
          return reject({ status: 400 }, { text: 'Id is not valid.' });
        }
        entity = new MongooseModel(req.body);
        entity._id = req.params.id;
        entity.save(function (err) {
          if (err) {
            return reject(err);
          }
          return resolve({ status: 201, entity: entity });
        });
      } else {
        (function () {
          // edit entity
          var originEntity = JSON.parse(JSON.stringify(entity));
          entity = (0, _lodash.extend)(entity, req.body);
          entity.save(function (err) {
            if (err) {
              return reject(err);
            }

            return resolve({ entity: entity, originEntity: originEntity });
          });
        })();
      }
    });
  });
};

module.exports = exports['default'];