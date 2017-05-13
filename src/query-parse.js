export default function parse(query) {
  // {
  //   $top: 13,
  //   $skip: 23,
  // }
  const result = {};
  result.top = parseTop(query.$top);
}

function parseCount(count) {
  const number = +count;
  if (number > 0) {
    return Math.floor(number);
  }
}
