import { min } from '../utils';

// ?$skip=10
// ->
// query.skip(10)
export default (query, skip, maxSkip) => new Promise((resolve) => {
  if (Number.isNaN(+skip)) {
    resolve();
    return;
  }
  const _skip = min([maxSkip, skip]);
  if (_skip > 0) {
    query.skip(_skip);
  }
  resolve();
});
