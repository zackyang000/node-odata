'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
// ?$skip=10
// ->
// query.skip(10)

exports['default'] = function (query, $orderby) {
  return new Promise(function (resolve, reject) {
    if (!$orderby) {
      return resolve();
    }

    var order = {};
    var orderbyArr = $orderby.split(',');

    orderbyArr.map(function (item) {
      var data = item.trim().split(' ');
      if (data.length > 2) {
        return reject('odata: Syntax error at \'' + $orderby + '\', it\'s should be like \'ReleaseDate asc, Rating desc\'');
      }
      var key = data[0].trim();
      var value = data[1] || 'asc';
      order[key] = value;
    });
    query.sort(order);
    resolve();
  });
};

module.exports = exports['default'];