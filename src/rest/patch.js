export default (req, MongooseModel) => new Promise((resolve, reject) => {
  MongooseModel.findOne({ id: req.params.id }, (err, entity) => {
    if (err) {
      reject(err);
    } else {
      MongooseModel.update({ id: req.params.id }, { ...entity, ...req.body }, (err1) => {
        if (err1) {
          reject(err1);
        } else {
          resolve({ entity: req.body, originEntity: entity });
        }
      });
    }
  });
});
