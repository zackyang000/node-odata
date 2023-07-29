export default (req, res, next) => {
  req.$odata.Model.findById(req.$odata.$Key._id, (err, entity) => {
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
