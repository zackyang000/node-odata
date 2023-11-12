import applyClient from "../applyClient";

export default async (req, res, next) => {
  try {
    const entity = (await req.$odata.Model.findById(req.$odata.$Key._id)).toObject();

    if (req.$odata.clientField) {
      if (entity[req.$odata.clientField] !== req.$odata.client) {
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

    const patched = { ...entity, ...req.$odata.body };

    applyClient(req, patched);

    await req.$odata.Model.updateOne({ _id: req.$odata.$Key._id }, patched);
    res.$odata.result = patched;
    next();

  } catch (err) {
    next(err);
  }
}