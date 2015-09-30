"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _lodash = require("lodash");

// ?$skip=10
// ->
// query.skip(10)

exports["default"] = function (query, skip, maxSkip) {
  return new Promise(function (resolve, reject) {
    if (isNaN(+skip)) {
      return resolve();
    }
    skip = (0, _lodash.min)([maxSkip, skip]);
    if (skip <= 0) {
      return resolve();
    }
    query.skip(skip);
    resolve();
  });
};

module.exports = exports["default"];