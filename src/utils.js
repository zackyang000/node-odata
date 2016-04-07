// like _.min
export function min(arr) {
  return arr.map((item) => +item)
    .filter((item) => Number.isInteger(item))
    .reduce((current, next) => current < next ? current : next);
}

function merge(list) {
  return list.join(' ').trim();
}

// split by multiple keywords in a sentence, then return [content, keyword, content, ...]
export function split(sentence, keys) {
  let _keys = keys;
  if (!(_keys instanceof Array)) {
    _keys = [_keys];
  }
  const result = [];
  let tmp = [];
  const words = sentence.split(' ');
  words.forEach((word) => {
    if (_keys.indexOf(word) > -1) {
      result.push(merge(tmp));
      result.push(word);
      tmp = [];
    } else {
      tmp.push(word);
    }
  });
  result.push(merge(tmp));
  return result;
}
