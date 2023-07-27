// ?$skip=10
// ->
// query.skip(10)
export default (query, skip) => new Promise((resolve) => {
  if (Number.isNaN(+skip)) {
    resolve();
    return;
  }

  if (skip > 0) {
    query.skip(skip);
  }
  resolve();
});
