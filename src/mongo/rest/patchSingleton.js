import applyClient from "../applyClient";

export default async (req, res, next) => {
  try {
    const filter = req.$odata.clientField ? { [req.$odata.clientField]: req.$odata.client } : undefined;
    let entity = await req.$odata.Model.findOne(filter);

    if (req.$odata.clientField) {
      const bodyClient = req.$odata.body[req.$odata.clientField];

      if (bodyClient && bodyClient !== req.$odata.client) {
        const error = new Error('Client value in custom parameter differs from client value in body');

        error.status = 400;
        throw error;
      }
    }

    if (entity) {
      const patched = { ...entity.toObject(), ...req.$odata.body };

      applyClient(req, patched);
  
      await req.$odata.Model.updateOne({ _id: entity._id }, patched);
      res.$odata.result = patched;

    } else {
      entity = new req.$odata.Model();
      
      Object.keys(req.$odata.body).forEach(property =>
        entity[property] = req.$odata.body[property]
      );
      applyClient(req, entity);

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