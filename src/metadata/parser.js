'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

var isField = function isField(obj) {
  if (typeof obj === 'function') {
    return true;
  }
  if (typeof obj === 'object') {
    if (obj.type && typeof obj.type === 'function') {
      // 检测该 obj 下字段, 如果有除了 type 以外是 function 类型的字段, 表明该 obj 不是基本类型
      for (var _name in obj) {
        if (_name !== 'type' && typeof obj[_name] === 'function') {
          return false;
        }
      }
      return true;
    }
  }
  return false;
};

var isArray = function isArray(obj) {
  return Array.isArray(obj) && obj.length >= 0;
};

var isComplexArray = function isComplexArray(obj) {
  return isArray(obj) && isField(obj[0]);
};

var isObject = function isObject(obj) {
  return obj && typeof obj === 'object' && !isArray(obj) && !isField(obj);
};

var toMetadata = function toMetadata(obj) {
  var convert = function convert(obj, name, root) {
    var LEN = 'function '.length;
    if (isField(obj[name])) {
      if (typeof obj[name] === 'function') {
        obj[name] = obj[name].toString();
        obj[name] = obj[name].substr(LEN, obj[name].indexOf('(') - LEN);
      } else if (typeof obj[name] === 'object') {
        obj[name].type = obj[name].type.toString();
        obj[name].type = obj[name].type.substr(LEN, obj[name].type.indexOf('(') - LEN);
      }
    } else if (isComplexArray(obj[name])) {
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = obj[name][0][Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var childName = _step.value;

          convert(obj[name][0], childName);
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator['return']) {
            _iterator['return']();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }
    } else if (isArray(obj[name])) {
      obj[name][0] = obj[name][0].toString();
      obj[name][0] = obj[name][0].substr(LEN, obj[name][0].indexOf('(') - LEN);
    } else if (isObject(obj[name])) {
      Object.keys(obj[name]).map(function (childName) {
        convert(obj[name], childName);
      });
    }
  };
  convert({ obj: obj }, 'obj', true);
  return obj;
};

exports['default'] = { toMetadata: toMetadata };
module.exports = exports['default'];