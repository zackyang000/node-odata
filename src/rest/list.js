'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _parserCountParser = require('../parser/countParser');

var _parserCountParser2 = _interopRequireDefault(_parserCountParser);

var _parserFilterParser = require('../parser/filterParser');

var _parserFilterParser2 = _interopRequireDefault(_parserFilterParser);

var _parserOrderbyParser = require('../parser/orderbyParser');

var _parserOrderbyParser2 = _interopRequireDefault(_parserOrderbyParser);

var _parserSkipParser = require('../parser/skipParser');

var _parserSkipParser2 = _interopRequireDefault(_parserSkipParser);

var _parserTopParser = require('../parser/topParser');

var _parserTopParser2 = _interopRequireDefault(_parserTopParser);

var _parserSelectParser = require('../parser/selectParser');

var _parserSelectParser2 = _interopRequireDefault(_parserSelectParser);

exports['default'] = function (req, MongooseModel, options) {
  return new Promise(function (resolve, reject) {
    var params = {
      count: req.query.$count,
      filter: req.query.$filter,
      orderby: req.query.$orderby,
      skip: req.query.$skip,
      top: req.query.$top,
      select: req.query.$select };

    Promise.all([countQuery(MongooseModel, params), dataQuery(MongooseModel, params, options)]).then(function (results) {
      var content = {};
      results.map(function (result) {
        if (result && result.key) {
          content[result.key] = result.value;
        }
      });
      resolve({ entity: content });
    })['catch'](function (err) {
      reject({ status: 500, text: err });
    });
  });
};

function countQuery(model, _ref) {
  var count = _ref.count;
  var filter = _ref.filter;

  return new Promise(function (resolve, reject) {
    (0, _parserCountParser2['default'])(model, count, filter).then(function (count) {
      if (count !== undefined) {
        resolve({ key: '@odata.count', value: count });
      } else {
        resolve();
      }
    })['catch'](function (err) {
      reject(err);
    });
  });
}

function dataQuery(model, _ref2, options) {
  var filter = _ref2.filter;
  var orderby = _ref2.orderby;
  var skip = _ref2.skip;
  var top = _ref2.top;
  var select = _ref2.select;

  return new Promise(function (resolve, reject) {
    var query = model.find();
    (0, _parserFilterParser2['default'])(query, filter).then(function () {
      (0, _parserOrderbyParser2['default'])(query, orderby || options.orderby);
    }).then(function () {
      (0, _parserSkipParser2['default'])(query, skip, options.maxSkip);
    }).then(function () {
      (0, _parserTopParser2['default'])(query, top, options.maxTop);
    }).then(function () {
      (0, _parserSelectParser2['default'])(query, select);
    }).then(function () {
      query.exec(function (err, data) {
        if (err) {
          return reject(err);
        }
        resolve({ key: 'value', value: data });
      });
    })['catch'](function (err) {
      reject(err);
    });
  });
}
module.exports = exports['default'];

// TODO expand: req.query.$expand,
// TODO search: req.query.$search,