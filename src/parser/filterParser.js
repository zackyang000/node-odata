'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _slicedToArray(arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }

// Operator  Description             Example
// Comparison Operators
// eq        Equal                   Address/City eq 'Redmond'
// ne        Not equal               Address/City ne 'London'
// gt        Greater than            Price gt 20
// ge        Greater than or equal   Price ge 10
// lt        Less than               Price lt 20
// le        Less than or equal      Price le 100
// has       Has flags               Style has Sales.Color'Yellow'    #todo
// Logical Operators
// and       Logical and             Price le 200 and Price gt 3.5
// or        Logical or              Price le 3.5 or Price gt 200     #todo
// not       Logical negation        not endswith(Description,'milk') #todo

// eg.
//   http://host/service/Products?$filter=Price lt 10.00
//   http://host/service/Categories?$filter=Products/$count lt 10

var _functionsParser = require('./functionsParser');

var _functionsParser2 = _interopRequireDefault(_functionsParser);

exports['default'] = function (query, $filter) {
  return new Promise(function (resolve, reject) {
    if (!$filter) {
      return resolve();
    }

    var SPLIT_MULTIPLE_CONDITIONS = /(.+?)(?:and(?=(?:[^']*'[^']*')*[^']*$)|$)/g;
    var SPLIT_KEY_OPERATOR_AND_VALUE = /(.+?)(?: (?=(?:[^']*'[^']*')*[^']*$)|$)/g;

    var condition = undefined;
    if (stringHelper.has($filter, 'and')) {
      condition = $filter.match(SPLIT_MULTIPLE_CONDITIONS).map(function (s) {
        return stringHelper.removeEndOf(s, 'and').trim();
      });
    } else {
      condition = [$filter.trim()];
    }

    condition.map(function (item) {
      var conditionArr = item.match(SPLIT_KEY_OPERATOR_AND_VALUE).map(function (s) {
        return s.trim();
      }).filter(function (n) {
        return n;
      });
      if (conditionArr.length !== 3) {
        return reject('Syntax error at \'' + item + '\'.');
      }

      var _conditionArr = _slicedToArray(conditionArr, 3);

      var key = _conditionArr[0];
      var odataOperator = _conditionArr[1];
      var value = _conditionArr[2];

      var _validator$formatValue = validator.formatValue(value);

      var val = _validator$formatValue.val;
      var err = _validator$formatValue.err;

      if (err) {
        return reject(err);
      }

      // function query
      var functionKey = key.substring(0, key.indexOf('('));
      if (functionKey in { indexof: 1, year: 1 }) {
        _functionsParser2['default'][functionKey](query, key, odataOperator, val);
      } else {
        // operator query
        switch (odataOperator) {
          case 'eq':
            query.where(key).equals(val);
            break;
          case 'ne':
            query.where(key).ne(val);
            break;
          case 'gt':
            query.where(key).gt(val);
            break;
          case 'ge':
            query.where(key).gte(val);
            break;
          case 'lt':
            query.where(key).lt(val);
            break;
          case 'le':
            query.where(key).lte(val);
            break;
          default:
            return reject('Incorrect operator at \'#{item}\'.');
        }
      }
    });
    resolve();
  });
};

var stringHelper = {
  has: function has(str, key) {
    return str.indexOf(key) >= 0;
  },

  isBeginWith: function isBeginWith(str, key) {
    return str.indexOf(key) === 0;
  },

  isEndWith: function isEndWith(str, key) {
    return str.lastIndexOf(key) === str.length - key.length;
  },

  removeEndOf: function removeEndOf(str, key) {
    if (stringHelper.isEndWith(str, key)) {
      return str.substr(0, str.length - key.length);
    }
    return str;
  } };

var validator = {
  formatValue: function formatValue(value) {
    if (value === 'true') {
      value = true;
    } else if (value === 'false') {
      value = false;
    } else if (+value === +value) {
      value = +value;
    } else if (stringHelper.isBeginWith(value, '\'') && stringHelper.isEndWith(value, '\'')) {
      value = value.slice(1, -1);
    } else {
      return { err: 'Syntax error at \'' + value + '\'.' };
    }
    return { val: value };
  }
};
module.exports = exports['default'];