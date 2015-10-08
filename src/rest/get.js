"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports["default"] = function (req, MongooseModel) {
  return new Promise(function (resolve, reject) {
    MongooseModel.findOne({ _id: req.params.id }, function (err, entity) {
      if (err) {
        return reject(err);
      }

      if (!entity) {
        return reject({ status: 404 }, { text: "Not Found" });
      }

      return resolve({ entity: entity });
    });
  });
};

module.exports = exports["default"];