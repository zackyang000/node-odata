"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports["default"] = function (req, MongooseModel) {
  return new Promise(function (resolve, reject) {
    MongooseModel.remove({ _id: req.params.id }, function (err, result) {
      if (err) {
        return reject(err);
      }

      if (JSON.parse(result).n === 0) {
        return reject({ status: 404 }, { text: "Not Found" });
      }

      return resolve();
    });
  });
};

module.exports = exports["default"];