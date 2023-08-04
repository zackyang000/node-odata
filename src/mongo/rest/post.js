export default async (req, res, next) => {
  try {
    if (!Object.keys(req.body).length) {
      const error = new Error();

      error.status = 422;
      throw error;

    }

    const entity = new req.$odata.Model(req.body);

    await entity.save();
    res.$odata.result = entity.toObject();
    res.$odata.status = 201;
    next();

  } catch (err) {
    next(err);
  }
};
