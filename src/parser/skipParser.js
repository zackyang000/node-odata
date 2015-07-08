"use strict";

import { isNumber, min } from 'lodash';

// ?$skip=10
// ->
// query.skip(10)
export default (query, skip = 0, maxSkip = 10000) => {
  console.log(skip);
  console.log(isNumber(skip));
  console.log(isNumber(+skip));
  if (!isNumber(+skip)) {
    return;
  }
  skip = min([maxSkip, skip]);
  if (skip < 0) {
    return;
  }
  console.log(skip);
  console.log('done');
  query.skip(skip);
};
