function _updateEntity(resolve, reject, MongooseModel, req, entity) {
  // TODO: 这样会导致 put 效果与 patch 相同.
  MongooseModel.update({ id: entity.id }, req.body, (err) => {
    if (err) {
      return reject(err);
    }
    return resolve({ entity: req.body, originEntity: entity });
  });
}

function _createEntity(resolve, reject, MongooseModel, req, entity) {
  const uuidReg = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidReg.test(req.params.id)) {
    return reject({ status: 400 }, { text: 'Id is not valid.' });
  }
  const newEntity = new MongooseModel(req.body);
  newEntity._id = req.params.id;
  newEntity.save((err) => {
    if (err) {
      return reject(err);
    }
    return resolve({ status: 201, entity: newEntity, originEntity: entity });
  });
}

export default (req, MongooseModel) => new Promise((resolve, reject) => {
  MongooseModel.findOne({ _id: req.params.id }, (err, entity) => {
    if (err) {
      return reject(err);
    }
    return entity
      ? _updateEntity(resolve, reject, MongooseModel, req, entity)
      : _createEntity(resolve, reject, MongooseModel, req, entity);
  });
});
