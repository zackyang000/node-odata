"use strict";

import { min } from 'lodash';

// ?$skip=10
// ->
// query.skip(10)
export default (query, skip = 0, maxSkip = 10000) => {
  if (isNaN(+skip)) {
    return;
  }
  skip = min([maxSkip, skip]);
  if (skip < 0) {
    return;
  }
  query.skip(skip);
};
