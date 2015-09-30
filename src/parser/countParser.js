'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _filterParser = require('./filterParser');

var _filterParser2 = _interopRequireDefault(_filterParser);

// ?$skip=10
// ->
// query.skip(10)

exports['default'] = function (mongooseModel, $count, $filter) {
  return new Promise(function (resolve, reject) {
    if ($count === undefined) {
      return resolve();
    }

    switch ($count) {
      case 'true':
        var query = mongooseModel.find();
        (0, _filterParser2['default'])(query, $filter);
        query.count(function (err, count) {
          return resolve(count);
        });
        break;
      case 'false':
        return resolve();
      default:
        return reject('Unknown $count option, only "true" and "false" are supported.');
    }
  });
};

module.exports = exports['default'];