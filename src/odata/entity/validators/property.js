export default function validateProperty(name, req, entity, currentMetadata) {
  const property = name.toString();

  if (currentMetadata[property]) {
    return currentMetadata[property];
  }

  const indexDot = property.indexOf('.');
  if ( indexDot > 0) {
    const nextProperty = property.substr(indexDot + 1);
    const complexType = property.substr(0, indexDot);

    return validateProperty(nextProperty, req, entity, req.$odata.$metadata.complexType(currentMetadata[complexType].$Type));
  }

  const err = new Error(`Entity '${entity}' has no property named '${property}'`);

  err.status = 400;
  err.target = property;
  throw err;
}