'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _slicedToArray(arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }

// indexof(CompanyName,'X') eq 1
var indexof = function indexof(query, key, odataOperator, value) {
  var target = undefined;

  var _key$substring$split = key.substring(key.indexOf('(') + 1, key.indexOf(')')).split(',');

  var _key$substring$split2 = _slicedToArray(_key$substring$split, 2);

  key = _key$substring$split2[0];
  target = _key$substring$split2[1];
  var _ref = [key.trim(), target.trim()];
  key = _ref[0];
  target = _ref[1];

  var operator = convertToOperator(odataOperator);
  query.$where('this.' + key + '.indexOf(' + target + ') ' + operator + ' ' + value);
};

// year(publish_date) eq 2000
var year = function year(query, key, odataOperator, value) {
  key = key.substring(key.indexOf('(') + 1, key.indexOf(')'));

  var start = new Date(+value, 0, 1);
  var end = new Date(+value + 1, 0, 1);

  switch (odataOperator) {
    case 'eq':
      query.where(key).gte(start).lt(end);
      break;
    case 'ne':
      var condition = [{}, {}];
      condition[0][key] = { $lt: start };
      condition[1][key] = { $gte: end };
      query.or(condition);
      break;
    case 'gt':
      query.where(key).gte(end);
      break;
    case 'ge':
      query.where(key).gte(start);
      break;
    case 'lt':
      query.where(key).lt(start);
      break;
    case 'le':
      query.where(key).lt(end);
      break;
  }
};

var convertToOperator = function convertToOperator(odataOperator) {
  var operator = undefined;
  switch (odataOperator) {
    case 'eq':
      operator = '==';
      break;
    case 'ne':
      operator = '!=';
      break;
    case 'gt':
      operator = '>';
      break;
    case 'ge':
      operator = '>=';
      break;
    case 'lt':
      operator = '<';
      break;
    case 'le':
      operator = '<=';
      break;
  }
  return operator;
};

exports['default'] = { indexof: indexof, year: year };
module.exports = exports['default'];