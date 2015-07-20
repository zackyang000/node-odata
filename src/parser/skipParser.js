"use strict";

import { min } from 'lodash';

// ?$skip=10
// ->
// query.skip(10)
export default (query, skip, maxSkip) => {
  if (isNaN(+skip)) {
    return;
  }
  skip = min([maxSkip, skip]);
  if (skip <= 0) {
    return;
  }
  query.skip(skip);
};
