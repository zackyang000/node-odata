"use strict";

const SYSTEM_MAX_TOP = 1000000

// ?$top=10
// ->
// query.top(10)
export default (query, top, maxTop) => {
  top = min([SYSTEM_MAX_TOP, maxTop, top]);
  if (top < 0) {
    top = SYSTEM_MAX_TOP;
  }
  query.limit(top);
}
