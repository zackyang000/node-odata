"use strict";

import { min } from 'lodash';

// ?$top=10
// ->
// query.top(10)
export default (query, top = 0, maxTop = 10000) => {
  if (isNaN(+top)) {
    return;
  }
  top = min([maxTop, top]);
  if (top < 0) {
    return;
  }
  query.limit(top);
};
