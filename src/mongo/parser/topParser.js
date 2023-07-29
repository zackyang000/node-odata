// ?$top=10
// ->
// query.top(10)
export default (query, top) => new Promise((resolve) => {
  if (top > 0) {
    query.limit(top);
  }
  resolve();
});
