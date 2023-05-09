export default (req, MongooseModel) => new Promise((resolve, reject) => {
  MongooseModel.findById(req.params.id, (err, entity) => {
    if (err) {
      return reject(err);
    }

    if (!entity) {
      const result = new Error('Not Found');

      result.status = 404;
      return reject(result);
    }

    return resolve({
      result: entity,
      status: 200
    });
  });
});
