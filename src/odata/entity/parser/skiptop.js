import { min } from '../../../utils';

function parse(value, options) {
  const input = value;

  if (!input) {
    return;
  }

  const result = +input;
  if (Number.isNaN(result)) {
    const err = new Error(`Value '${input}' should be a number`);

    err.status = 400;
    throw err;
  }

  if (result < 0) {
    const err = new Error(`Value '${result}' should be a positive number`);

    err.status = 400;
    throw err;
  }

  return min([result, options]);
}

export function parseSkip(req, options) {
  return parse(req.query.$skip, options);
}

export function parseTop(req, options) {
  return parse(req.query.$top, options);
}