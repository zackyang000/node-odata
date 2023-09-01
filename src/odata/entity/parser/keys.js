import parseValue from '../../parser/value';
import parseProperty from './property';
import validateProperty from '../validators/property';

export default function(req, entity, metadata, mapping) {
  const result = {};

  if (req.params) {
    const params = Object.keys(req.params)
      .filter(param => metadata.$Key.indexOf(param) >= 0);

    if (params) {
      params.forEach(param => {
        const property = parseProperty(param, mapping);
        const propertyMetadata = validateProperty(param, req, entity, metadata);

        result[property] = parseValue(req.params[param], propertyMetadata);
      });
    }
  }

  return result;
}