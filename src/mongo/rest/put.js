function _updateEntity(req, res, next, entity) {
  req.$odata.Model.findByIdAndUpdate(entity.id, req.body, (err) => {
    if (err) {
      return next(err);
    }
    const newEntity = req.body;
    
    newEntity.id = entity.id;
    res.$odata.result = newEntity;

    return next();
  });
}

function _createEntity(req, res, next) {
  const uuidReg = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidReg.test(req.params.id)) {
    const err = new Error('Id is invalid.');

    err.status = 400;
    return next(err);
  }
  const newEntity = MongooseModel.create(req.body);
  newEntity._id = req.params.id;
  return newEntity.save((err2) => {
    if (err2) {
      return next(err2);
    }
    res.$odata.result = newEntity.toObject();
    res.$odata.status = 201;
    return next();
  });
}

export default (req, res, next) =>  {
  req.$odata.Model.findOne({ _id: req.params.id }, (err, entity) => {
    if (err) {
      return next(err);
    }
    if (entity) {
      _updateEntity(req, res, next, entity);
    } else {
      _createEntity(req, res, next);
    }
  });
};
