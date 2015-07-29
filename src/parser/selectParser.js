"use strict";

// ?$select=Rating,ReleaseDate
// ->
// query.select('Rating ReleaseDate')
export default (query, $select) => {
  return new Promise((resolve, reject) => {
    if(!$select) {
      return resolve();
    }

    let list = $select.split(',').map(function(item) { return item.trim(); });

    let selectFields = { _id: 0 };
    let tree = query.model.schema.tree;
    Object.keys(tree).map((item) => {
      if (list.indexOf(item) >= 0) {
        if (item === 'id') {
          selectFields._id = 1;
        }
        else if (typeof tree[item] === 'function' || tree[item].select !== false) {
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
