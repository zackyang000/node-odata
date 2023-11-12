import parseProperty from "./property";
import validateProperty from "../validators/property";

export default function parseOrderBy(req, entity, metadata, mapping, options) {
  const orderby = options || req.query.$orderby;

  if (orderby) {
    const found = orderby.match(/([^ ,]+)\s*(asc|desc)?/gi);

    if (!found) {
      throw new Error(`Orderby value '${orderby}' can not be parsed`);
    }

    return [...found.map(singleOrder => {
      const operands = singleOrder.match(/([^ ,]+)\s*(asc|desc)?/i);
      const property = parseProperty(operands[1], req, entity, metadata, mapping);

      validateProperty(operands[1], req, entity, metadata);
      
      return [property, operands[2]?.trim().toLowerCase() || 'asc']
    })];
  }
}