function _updateEntity(req, res, next, entity) {
  req.$odata.Model.findByIdAndUpdate(entity.id, req.$odata.body, (err) => {
    if (err) {
      return next(err);
    }
    const newEntity = req.$odata.body;
    
    newEntity.id = entity.id;
    res.$odata.result = newEntity;

    return next();
  });
}

function _createEntity(req, res, next) {
  const uuidReg = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidReg.test(req.$odata.$Key._id)) {
    const err = new Error('Id is invalid.');

    err.status = 400;
    return next(err);
  }
  const newEntity = new req.$odata.Model(req.$odata.body);
  newEntity._id = req.$odata.$Key._id;
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
  req.$odata.Model.findOne({ _id: req.$odata.$Key._id }, (err, entity) => {
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
