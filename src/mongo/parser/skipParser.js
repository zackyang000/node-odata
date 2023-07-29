// ?$skip=10
// ->
// query.skip(10)
export default (query, skip) => new Promise((resolve) => {
  if (skip > 0) {
    query.skip(skip);
  }
  resolve();
});
