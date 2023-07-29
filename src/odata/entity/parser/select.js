import parseProperty from "./property";
import validateProperty from "../validators/property";

export default function(req, entity, metadata, mapping) {
  return req.query.$select?.split(',').map((item) => {
    const property = parseProperty(item.trim(), mapping);

    validateProperty(item.trim(), req, entity, metadata);

    return property;
  });
}