export default (req, res, next) => {
  if (!Object.keys(req.body).length) {
    const error = new Error();

    error.status = 422;
    next(error);
  } else {
    const entity = new req.$odata.Model(req.body);

    entity.save((err) => {
      if (err) {
        next(err);
      } else {
        res.$odata.result = entity.toObject();
        res.$odata.status = 201;
        next();
      }
    });
  }
};
