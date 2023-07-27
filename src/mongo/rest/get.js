export default (req, res, next) => {
  req.$odata.Model.findById(req.params.id, (err, entity) => {
    if (err) {
      return next(err);
    }

    if (!entity) {
      const result = new Error('Not Found');

      result.status = 404;
      return next(result);
    }

    res.$odata.result = entity.toObject();
    return next();
  });
};
