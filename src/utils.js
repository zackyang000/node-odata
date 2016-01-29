export function min(arr) {
  return arr.filter((item) => Number.isInteger(item))
    .reduce((current, next) => current < next ? current : next);
}
