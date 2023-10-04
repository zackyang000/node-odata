export default (query, $select) => new Promise((resolve) => {
  if (!$select?.length) {
    resolve();
    return;
  }

  const list = $select;

  const selectFields = { _id: 0 };
  list.forEach(item => selectFields[item] = 1 );

  if (Object.keys(selectFields).length === 1 && selectFields._id === 0) {
    resolve();
    return;
  }

  query.select(selectFields);
  resolve();
});
