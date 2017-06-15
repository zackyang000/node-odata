const { min } = require('./../utils');

// ?$skip=10
// ->
// query.skip(10)
module.exports = (query, skip, maxSkip) => new Promise((resolve) => {
  if (isNaN(+skip)) {
    return resolve();
  }
  const _skip = min([maxSkip, skip]);
  if (_skip <= 0) {
    return resolve();
  }
  query.skip(_skip);
  return resolve();
});
