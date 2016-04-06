// like _.min
export function min(arr) {
  return arr.map((item) => +item)
    .filter((item) => Number.isInteger(item))
    .reduce((current, next) => current < next ? current : next);
}
