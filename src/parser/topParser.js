const { min } = require('./../utils');

// ?$top=10
// ->
// query.top(10)
module.exports = (query, top, maxTop) => new Promise((resolve) => {
  if (isNaN(+top)) {
    return resolve();
  }
  const _top = min([maxTop, top]);
  if (_top <= 0) {
    return resolve();
  }
  query.limit(_top);
  return resolve();
});
