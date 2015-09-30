"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _express = require("express");

var _express2 = _interopRequireDefault(_express);

var Function = function Function() {
  _classCallCheck(this, Function);

  return _express2["default"].Router();
};

exports["default"] = Function;
module.exports = exports["default"];