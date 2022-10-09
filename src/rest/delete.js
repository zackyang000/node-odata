export default (req, MongooseModel) => new Promise((resolve, reject) => {
  MongooseModel.remove({ _id: req.params.id }, (err, result) => {
    if (err) {
      return reject(err);
    }

    if (JSON.parse(result).n === 0) {
      const error = new Error('Not Found');

      error.status = 404;
      return reject(error);
    }

    return resolve({ status: 204 });
  });
});
