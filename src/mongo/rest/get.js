function throwNotFound() {
  const result = new Error('Not Found');

  result.status = 404;
  throw result;
}
export default async (req, res, next) => {
  try {
    let entity = await req.$odata.Model.findById(req.$odata.$Key._id);

    if (!entity) { 
      throwNotFound();
    }

    entity = entity.toObject();

    if (req.$odata.clientField && entity[req.$odata.clientField] !== req.$odata.client) { // client check
      throwNotFound();
    }

    res.$odata.result = entity;
    next();

  } catch (err) {
    next(err);
  }

};
