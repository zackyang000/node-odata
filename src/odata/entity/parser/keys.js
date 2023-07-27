import parseValue from './value';

export default function(req, entity, metadata) {
  const result = {};

  if (req.params) {
    const params = Object.keys(req.params)
      .filter(param => metadata.$Key.indexOf(param) >= 0);

    if (params) {
      params.forEach(param => {
        result[param] = parseValue(req.params[param], metadata[param]);
      });
    }
  }

  return result;
}