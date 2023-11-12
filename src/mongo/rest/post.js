import applyClient from "../applyClient";

export default async (req, res, next) => {
  try {
    if (!Object.keys(req.body).length) {
      const error = new Error();

      error.status = 422;
      throw error;

    }
    if (req.$odata.clientField) {
      const bodyField = req.body[req.$odata.clientField];

      if (bodyField && bodyField !== req.$odata.client) {
        const error = new Error('Client value in custom parameter differs from client value in body');

        error.status = 400;
        throw error;
      }

    }

    const entity = new req.$odata.Model(req.body);

    applyClient(req, entity);

    await entity.save({
      validateBeforeSave: true,
      validateModifiedOnly: true
    });
    res.$odata.result = entity.toObject();
    res.$odata.status = 201;
    next();

  } catch (err) {
    next(err);
  }
};
