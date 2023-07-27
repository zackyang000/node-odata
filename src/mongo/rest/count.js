export default (req, res, next) => {
  const query = req.$odata.Model.find();

  query.count((err, count) => {
    if (err) {
      const result = new Error(err.message);

      result.previous = err;
      result.status = 500;
      next(result);

    } else {
      res.$odata.result = count.toString();
      res.$odata.supportedMimetypes = ['text/plain'];
      next();

    }
  });
};
