import applyClient from "../applyClient";

export default async (req, res, next) => {
  try {
    const entity = await req.$odata.Model.findOne({ _id: req.$odata.$Key._id });

    if (req.$odata.clientField) {
      if (entity && entity.client !== req.$odata.client) {
        const error1 = new Error('Not found');
  
        error1.status = 404;
        throw error1;
      }

      const bodyClient = req.$odata.body[req.$odata.clientField];

      if (bodyClient && bodyClient !== req.$odata.client) {
        const error2 = new Error('Client value in custom parameter differs from client value in body');

        error2.status = 400;
        throw error2;
      }
    }

    if (entity) {
      const newEntity = req.$odata.body;

      applyClient(req, newEntity);
      await req.$odata.Model.findByIdAndUpdate(entity._id, req.$odata.body);

      newEntity._id = entity._id;
      res.$odata.result = newEntity;

    } else {
      const uuidReg = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

      if (!uuidReg.test(req.$odata.$Key._id)) {
        const err = new Error('Id is invalid.');

        err.status = 400;
        return next(err);
      }
      const newEntity = new req.$odata.Model(req.$odata.body);

      newEntity._id = req.$odata.$Key._id;
      await newEntity.save({
        validateBeforeSave: true,
        validateModifiedOnly: true
      });

      res.$odata.result = newEntity.toObject();
      res.$odata.status = 201;
    }

    next();

  } catch (err) {
    next(err);
  }
};
