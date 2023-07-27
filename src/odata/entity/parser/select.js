export default function(req, entity, metadata) {
  return req.query.$select?.split(',').map((item) => {
    const property = item.trim();

    if (!metadata[property]) {
      const err = new Error(`Entity '${entity}' have not a property with name '${property}'`);

      err.status = 400;
      throw err;
    }

    return property;
  });
}