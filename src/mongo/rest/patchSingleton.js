export default async (req, res, next) => {
  try {
    let entity = await req.$odata.Model.findOne();

    if (entity) {
      const patched = { ...entity.toObject(), ...req.$odata.body };
  
      await req.$odata.Model.updateOne({ _id: entity._id }, patched);
      res.$odata.result = patched;

    } else {
      entity = new req.$odata.Model();
      Object.keys(req.$odata.body).forEach(property =>
        entity[property] = req.$odata.body[property]
      );
      await entity.save({
        validateBeforeSave: true,
        validateModifiedOnly: true
      });
      res.$odata.result = entity.toObject();

    }
    next();

  } catch (err) {
    next(err);
  }
}