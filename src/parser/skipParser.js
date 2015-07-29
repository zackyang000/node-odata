"use strict";

import { min } from 'lodash';

// ?$skip=10
// ->
// query.skip(10)
export default (query, skip, maxSkip) => {
  return new Promise((resolve, reject) => {
    if (isNaN(+skip)) {
      return resolve();
    }
    skip = min([maxSkip, skip]);
    if (skip <= 0) {
      return resolve();
    }
    query.skip(skip);
    resolve();
  });
};
