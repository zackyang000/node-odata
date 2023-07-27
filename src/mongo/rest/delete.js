export default (req, res, next) => {
  req.$odata.Model.remove({ _id: req.params.id }, (err, result) => {
    if (err) {
      return next(err);
    }

    if (JSON.parse(result).n === 0) {
      const error = new Error('Not Found');

      error.status = 404;
      return next(error);
    }

    res.$odata.status = 204;
    next();
  });
};
