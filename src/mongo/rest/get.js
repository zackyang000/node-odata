export default async (req, res, next) => {
  try {
    const entity = await req.$odata.Model.findById(req.$odata.$Key._id);

    if (!entity) {
      const result = new Error('Not Found');

      result.status = 404;
      throw result;
    }

    res.$odata.result = entity.toObject();
    next();

  } catch (err) {
    next(err);
  }

};
