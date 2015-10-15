"use strict";

import { min } from 'lodash';

// ?$top=10
// ->
// query.top(10)
export default (query, top, maxTop) => {
  return new Promise((resolve, reject) => {
    if (isNaN(+top)) {
      return resolve();
    }
    top = min([maxTop, top]);
    if (top <= 0) {
      return resolve();
    }
    query.limit(top);
    resolve();
  });
};
