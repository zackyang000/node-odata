"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _lodash = require("lodash");

// ?$top=10
// ->
// query.top(10)

exports["default"] = function (query, top, maxTop) {
  return new Promise(function (resolve, reject) {
    if (isNaN(+top)) {
      return resolve();
    }
    top = (0, _lodash.min)([maxTop, top]);
    if (top <= 0) {
      return resolve();
    }
    query.limit(top);
    resolve();
  });
};

module.exports = exports["default"];