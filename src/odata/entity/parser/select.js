import parseProperty from "./property";
import validateProperty from "../validators/property";

export default function(req, entity, metadata, mapping) {
  return req.query.$select?.split(',').map((item) => {
    const name = item.trim().replace('/', '.');
    const property = parseProperty(name, mapping);

    validateProperty(name, req, entity, metadata);

    return property;
  });
}