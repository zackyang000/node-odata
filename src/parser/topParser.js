"use strict";

import { isNumber, min } from 'lodash';

// ?$top=10
// ->
// query.top(10)
export default (query, top = 0, maxTop = 10000) => {
  if (!isNumber(+top)) {
    return;
  }
  top = min([maxTop, top]);
  if (top < 0) {
    return;
  }
  query.limit(top);
};
