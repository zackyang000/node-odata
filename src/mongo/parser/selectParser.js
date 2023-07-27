// ?$select=Rating,ReleaseDate
// ->
// query.select('Rating ReleaseDate')
export default (query, $select) => new Promise((resolve) => {
  if (!$select?.length) {
    resolve();
    return;
  }

  const list = $select;

  const selectFields = { _id: 0 };
  const { tree } = query.model.schema;
  Object.keys(tree).map((item) => {
    if (list.indexOf(item) >= 0) {
      if (item === 'id') {
        selectFields._id = 1;
      } else if (typeof tree[item] === 'function' || tree[item].select !== false) {
        selectFields[item] = 1;
      }
    }
    return undefined;
  });

  if (Object.keys(selectFields).length === 1 && selectFields._id === 0) {
    resolve();
    return;
  }

  query.select(selectFields);
  resolve();
});
