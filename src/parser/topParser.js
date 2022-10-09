import { min } from '../utils';

// ?$top=10
// ->
// query.top(10)
export default (query, top, maxTop) => new Promise((resolve) => {
  if (Number.isNaN(+top)) {
    resolve();
    return;
  }
  const _top = min([maxTop, top]);
  if (_top > 0) {
    query.limit(_top);
  }
  resolve();
});
