export default async (req, res, next) => {
  try {
    const entity = await req.$odata.Model.findOne({ _id: req.$odata.$Key._id });

    if (entity) {
      await req.$odata.Model.findByIdAndUpdate(entity.id, req.$odata.body);

      const newEntity = req.$odata.body;

      newEntity.id = entity.id;
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
      await newEntity.save();

      res.$odata.result = newEntity.toObject();
      res.$odata.status = 201;
    }

    next();

  } catch (err) {
    next(err);
  }
};
