'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
// ?$select=Rating,ReleaseDate
// ->
// query.select('Rating ReleaseDate')

exports['default'] = function (query, $select) {
  return new Promise(function (resolve, reject) {
    if (!$select) {
      return resolve();
    }

    var list = $select.split(',').map(function (item) {
      return item.trim();
    });

    var selectFields = { _id: 0 };
    var tree = query.model.schema.tree;
    Object.keys(tree).map(function (item) {
      if (list.indexOf(item) >= 0) {
        if (item === 'id') {
          selectFields._id = 1;
        } else if (typeof tree[item] === 'function' || tree[item].select !== false) {
          selectFields[item] = 1;
        }
      }
    });

    if (Object.keys(selectFields).length === 1 && selectFields._id === 0) {
      return resolve();
    }

    query.select(selectFields);
    resolve();
  });
};

module.exports = exports['default'];